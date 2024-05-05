import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { sendAIQuery } from "../services/ApiService";
import { FaSpinner } from "react-icons/fa";
import { GiFlexibleStar } from "react-icons/gi";

function AIQueryDialog({
  strategyId,
  queryType,
  open,
  setOpen,
  markdownContent,
  setMarkdownContent,
  saveContent,
}: {
  strategyId: string;
  queryType: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  saveContent(type: string, content: string): void;
}) {
  const [sending, setSending] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  const sendQuery = () => {
    setSending(true);
    sendAIQuery(strategyId, queryType, query, markdownContent).then((res) => {
      setMarkdownContent(res);
      setSending(false);
    });
  };

  const handleSaveContent = () => {
    saveContent(queryType, markdownContent);
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        maxWidth="lg"
        fullWidth
        open={open}
        onClose={() => setOpen(false)}
        style={{
          padding: 10,
        }}
      >
        <DialogTitle>AI Query</DialogTitle>
        <DialogContent
          style={{
            padding: "10px 30px",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <TextField
                multiline
                maxRows={4}
                label="Query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={sendQuery}
                endIcon={sending ? <FaSpinner /> : <GiFlexibleStar />}
                disabled={sending || query === ""}
              >
                Generate
              </Button>
            </Grid>
            <Grid item xs={12} style={{
                margin: "10px 15px",
                border: "1px solid #ccc",
                padding: 10,
                borderRadius: 5,
                minHeight: 400,
                maxHeight: 500,
                overflow: "auto",
            }}>
              {markdownContent === "" && sending === false ? (
                <div style={{ textAlign: "center" }}>No content</div>
              ) : (
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              )}
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveContent} color="primary">
                OK
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AIQueryDialog;
