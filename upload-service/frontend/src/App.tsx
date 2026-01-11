import React from "react"
import { FileUpload } from "@/components/ui/uploadField"

function App() {
    return (
            <FileUpload
                onUploadSuccess={(uploadId) => {
                    console.log("Upload erfolgreich:", uploadId)
                    // 👉 hier später Course-Service informieren
                }}
            />
    )
}

export default App
