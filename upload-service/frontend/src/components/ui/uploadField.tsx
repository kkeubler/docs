import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// TODO: Drag & Drop größer(react-dropzone)
//
// TODO: Upload-Fortschritt (Progress Bar)
//
// TODO: Mehrere Dateien
//
// TODO: Validierung nach Dateigröße

type FileUploadProps = {
    onUploadSuccess?: (uploadId: string) => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const openFileDialog = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] ?? null
        setFile(selectedFile)
        setError(null)
    }

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch(
                "https://localhost:3000/api/v1/upload",
                {
                    method: "POST",
                    body: formData,
                }
            )

            if (!response.ok) throw new Error("Upload failed")

            const data: { uploadId: string } = await response.json()
            onUploadSuccess?.(data.uploadId)
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        } catch {
            setError("Upload fehlgeschlagen.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Upload your file</CardTitle>
                <CardDescription>
                    Only <strong>.pdf</strong> and <strong>.md</strong> are allowed.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Verstecktes File Input */}
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.md"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {!file ? (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={openFileDialog}
                    >
                        Datei auswählen
                    </Button>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Ausgewählt: <strong>{file.name}</strong>
                        </p>

                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={openFileDialog}
                        >
                            Datei ersetzen
                        </Button>
                    </div>
                )}

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full"
                    disabled={!file || isUploading}
                    onClick={handleUpload}
                >
                    {isUploading ? "Uploading..." : "Upload"}
                </Button>
            </CardFooter>
        </Card>
    )
}
