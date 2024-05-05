import { useParams } from "react-router-dom";
import { getStrategy, saveStrategy } from "../services/ApiService";
import { useEffect, useState } from "react";
import { StrategyDetailData } from "../types/Backtesting";
import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, CardHeader, Chip, IconButton } from "@mui/material";
import { FaCheckDouble, FaPencilAlt } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import "react-quill/dist/quill.snow.css";
import TextEditor from "./TextEditor";
import AIQueryDialog from "./AIQueryDialog";

type BlockEditingState = {
  description: boolean;
  explanation: boolean;
  example: boolean;
};

function StrategyDetail() {
  const [strategy, setStrategy] = useState<StrategyDetailData | null>(null);
  const [open, setOpen] = useState(false);
  const [queryType, setQueryType] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const { strategyId } = useParams<{ strategyId: string }>();
  useEffect(() => {
    getStrategy(strategyId!).then((data) => setStrategy(data));
  }, [strategyId]);

  const handleAIQuery = (queryType: string) => {
    setQueryType(queryType);
    setMarkdownContent(strategy![queryType as keyof StrategyDetailData] as string);
    setOpen(true);
  };

  const handleSaveContent = (type: string, content: string) => {
    setStrategy({
      ...strategy!,
      [type]: content,
    });

    handleSaveStrategy();
  }

  const handleSaveStrategy = () => {
    saveStrategy(strategyId!, strategy!);
  };

  const [blockEditingState, setBlockEditingState] = useState<BlockEditingState>(
    {
      description: false,
      explanation: false,
      example: false,
    }
  );

  const blockConfig = [
    {
      key: 'indicators',
      title: 'Indicators',
      editable: false,
    },
    {
      key: "description",
      title: "Description",
      editable: true,
    },
    {
      key: "explanation",
      title: "Explanation",
      editable: true,
    },
    {
      key: "example",
      title: "Example",
      editable: true,
    },
  ];

  const indicatorColors = ['primary', 'secondary', 'success', 'warning', 'info', 'error']

  return (
    <div className="strategy-detail">
      <AIQueryDialog
        open={open}
        setOpen={setOpen}
        strategyId={strategyId || ""}
        queryType={queryType}
        markdownContent={markdownContent}
        setMarkdownContent={setMarkdownContent}
        saveContent={handleSaveContent}
      />
      {strategy && (
        <Card>
          <CardHeader style={{
            color: "var(--text-color-primary)",
            textShadow: "1px 1px 1px var(--text-color-secondary)",
            padding: "30px 50px 10px 50px"
          }} title={strategy.name} />
          <CardContent>
            {blockConfig.map((block) => (
              <div key={block.key} style={{
                marginBottom: 10
              }}>
                <Accordion>
                  <AccordionSummary expandIcon={<MdExpandMore size='36px'/>}>
                    <h2 style={{
                      color: "var(--text-color-primary)",
                      padding: "10px 30px",
                      margin: 0
                    }}>{block.title}</h2>
                    { block.editable ? (
                      <>
                        <IconButton
                          disableRipple={true}
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setBlockEditingState({
                              ...blockEditingState,
                              [block.key]:
                                !blockEditingState[
                                  block.key as keyof BlockEditingState
                                ],
                            })
                          }}
                        >
                          <FaPencilAlt />
                        </IconButton>
                        &nbsp;
                        <IconButton
                          disableRipple={true}
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAIQuery(block.key as string);
                          }}
                        >
                          <FaCheckDouble />
                        </IconButton>
                      </>
                    ) : null }
                  </AccordionSummary>
                  <AccordionDetails style={{
                    padding: "0px 30px 10px 40px",
                    marginBottom: 10
                  }}>
                    {blockEditingState[block.key as keyof BlockEditingState] ? (
                      <TextEditor
                        value={
                          strategy[block.key as keyof StrategyDetailData] as string
                        }
                        onChange={(changes) => {
                          setStrategy({
                            ...strategy,
                            [block.key]: changes.markdown,
                          });
                        }}
                      />
                    ) : block.key === 'indicators' ? (
                      <>
                        {Array.isArray(strategy[block.key as keyof StrategyDetailData]) ? (
                          (strategy[block.key as keyof StrategyDetailData] as string[]).map((indicator, index) => (
                            <>
                              <Chip key={index} label={indicator} color={indicatorColors[index % indicatorColors.length] as any}/> &nbsp;
                            </>
                          ))
                        ) : (
                          <p>{strategy[block.key as keyof StrategyDetailData]}</p>
                        )}
                      </>
                    ) : (
                      <ReactMarkdown>
                        {Array.isArray(
                          strategy[block.key as keyof StrategyDetailData]
                        )
                          ? (
                              strategy[
                                block.key as keyof StrategyDetailData
                              ] as string[]
                            ).join("")
                          : (strategy[
                              block.key as keyof StrategyDetailData
                            ] as string)}
                      </ReactMarkdown>
                    )}
                  </AccordionDetails>
                </Accordion>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StrategyDetail;
