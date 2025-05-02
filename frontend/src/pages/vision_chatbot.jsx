import { useState } from "react";
import { FileInput, Paper, Text, Button, Group, Loader } from "@mantine/core";

export function SwingReview() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendFileToServer(file, message = "") {
    const url = "http://localhost:8000/api/vision/";
    const formData = new FormData();

    formData.append("video", file);
    formData.append("message", message); 
    setLoading(true);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
      });

      const data = await response.json();
      setUploadResponse(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper shadow="xs" radius="md" p="lg" style={{ maxWidth: 400, margin: "auto" }}>
      <Text size="lg" weight={700} align="center" style={{ marginBottom: "1rem" }}>
        Swing Video Upload
      </Text>

      <FileInput
        variant="filled"
        placeholder="Choose a file..."
        accept="video/*"
        onChange={(file) => {
          setSelectedFile(file);
          if (file) {
            sendFileToServer(file);
          }
        }}
      />

      <Group position="center" style={{ marginTop: "1rem" }}>
        {loading ? <Loader color="blue" /> : null}
        {selectedFile && <Text size="sm">Uploaded file: {selectedFile.name}</Text>}
        {uploadResponse && (
          <Text size="sm" color="green">
            Server Response: {uploadResponse.response}
          </Text>
        )}
      </Group>

      <Group position="center" mt="md">
        <Button variant="light" color="blue" radius="md" onClick={() => setSelectedFile(null)}>
          Clear Selection
        </Button>
      </Group>
    </Paper>
  );
}