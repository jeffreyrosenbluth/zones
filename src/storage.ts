// fileSystemTypes.ts
export interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | ArrayBuffer | ArrayBufferView | Blob): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

export interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(
    options?: FileSystemCreateWritableOptions
  ): Promise<FileSystemWritableFileStream>;
}

declare global {
  interface Window {
    showOpenFilePicker(options?: {
      multiple?: boolean;
      types?: {
        description?: string;
        accept: Record<string, string[]>;
      }[];
    }): Promise<FileSystemFileHandle[]>;

    showSaveFilePicker(options?: {
      suggestedName?: string;
      types?: {
        description?: string;
        accept: Record<string, string[]>;
      }[];
    }): Promise<FileSystemFileHandle>;
  }
}

// fileSystemStorage.ts
export type FileSystemOptions = {
  defaultPath?: string;
  defaultFileName?: string;
};

export class FileSystemJsonStorage {
  private options: FileSystemOptions;
  private fileHandle: FileSystemFileHandle | null = null;

  constructor(options: FileSystemOptions = {}) {
    this.options = {
      defaultPath: "",
      defaultFileName: "data.json",
      ...options,
    };
  }

  /**
   * Save data to a JSON file
   * @param data The data to save
   * @param saveAs Whether to show the file picker even if we have a file handle
   */
  async save<T>(data: T, saveAs: boolean = false): Promise<void> {
    try {
      if (!this.fileHandle || saveAs) {
        // Show file picker
        const picker =
          window.showSaveFilePicker as Window["showSaveFilePicker"];
        this.fileHandle = await picker({
          suggestedName: this.options.defaultFileName,
          types: [
            {
              description: "JSON File",
              accept: {
                "application/json": [".json"],
              },
            },
          ],
        });
      }

      const writableStream = await this.fileHandle.createWritable();
      await writableStream.write(JSON.stringify(data, null, 2));
      await writableStream.close();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled the file picker
        return;
      }
      throw new Error(
        `Failed to save file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Load data from a JSON file
   */
  async load<T>(): Promise<T> {
    try {
      const picker = window.showOpenFilePicker as Window["showOpenFilePicker"];
      const [fileHandle] = await picker({
        types: [
          {
            description: "JSON File",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });

      this.fileHandle = fileHandle;
      const file = await this.fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("File selection was cancelled");
      }
      throw new Error(
        `Failed to load file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check if the File System Access API is supported
   */
  static isSupported(): boolean {
    return "showOpenFilePicker" in window && "showSaveFilePicker" in window;
  }
}

// React hook
import { useState, useCallback } from "react";

export function useFileSystemJson<T>(
  initialValue: T,
  options?: FileSystemOptions
) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const storage = new FileSystemJsonStorage(options);

  const saveValue = useCallback(
    async (newValue: T, saveAs: boolean = false) => {
      setIsLoading(true);
      setError(null);
      try {
        await storage.save(newValue, saveAs);
        setValue(newValue);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadValue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await storage.load<T>();
      setValue(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    value,
    setValue: saveValue,
    loadValue,
    error,
    isLoading,
    isSupported: FileSystemJsonStorage.isSupported(),
  };
}
