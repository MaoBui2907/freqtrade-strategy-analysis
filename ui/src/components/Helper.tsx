import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import WebIcon from "@mui/icons-material/Web";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkIcon from "@mui/icons-material/Link";
import upw from "../upwork.svg";

const Helper = () => {
  return (
    <div className="helper">
      <Card
        style={{
          padding: "10px 30px",
        }}
      >
        <CardHeader title="AI Powered Freqtrade Strategies Builder" />
        <CardContent>
          <Typography variant="h2">What is this?</Typography>
          <Typography variant="body1">
            This application leverages the power of artificial intelligence to
            enhance the functionality of FreqTrade, an open-source
            cryptocurrency trading bot. It is designed to analyze and explain
            FreqTrade strategies, assist in the creation of custom trading
            strategies, and streamline the process of backtesting multiple
            strategies simultaneously. The application provides a user-friendly
            web interface that displays the results of backtests clearly and
            efficiently, making it easier for users to make informed trading
            decisions.
          </Typography>
          <Typography variant="h2">Features</Typography>
          <Typography variant="h3">AI-Powered Strategy Analysis</Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Strategy Explanation:</strong> Understand the mechanics
                and logic behind each trading strategy through detailed
                AI-generated explanations.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Example Generation:</strong> Get practical examples of
                how each strategy operates under different market conditions.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h3">Strategy Development Support</Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Custom Strategy Builder:</strong> Utilize AI assistance
                to craft tailored FreqTrade strategies that align with your
                trading preferences and goals.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h3">
            Advanced Backtesting Capabilities
          </Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Batch Backtesting:</strong> Conveniently run backtests
                on a collection of strategies to evaluate their performance over
                specific historical data.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Results Visualization:</strong> Access a comprehensive
                web UI that displays backtesting outcomes, helping you visualize
                the effectiveness of each strategy.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="body1">
            By integrating these features, the application aims to provide a
            robust toolset for both novice and experienced traders to optimize
            their trading strategies in the cryptocurrency markets.
          </Typography>
          <Typography variant="h2">Technical</Typography>
          <Typography variant="body1">
            Our application is built using a robust stack of modern technologies
            designed to ensure scalability, performance, and user-friendliness:
          </Typography>
          <Typography variant="h4">
            Programming Language & Frameworks:
          </Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Python:</strong> The core programming language used for
                developing the application.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>FastAPI:</strong> Employs this modern, fast web
                framework for building APIs with Python 3.7+.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>React:</strong> Utilizes this JavaScript library for
                building the interactive user interface.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h4">AI & Machine Learning:</Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Langchain:</strong> Leverages this toolkit to integrate
                language models effectively within the application.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Anthropic AI:</strong> Integrates this AI service for
                advanced model understanding and generation capabilities.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h4">Database & Storage:</Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>MongoDB:</strong> Utilizes this NoSQL database for
                efficient data management and storage.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>CosmosDB for MongoDB:</strong> Employs Azure’s fully
                managed database service with MongoDB compatibility for enhanced
                scalability and reliability.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h4">Hosting & Deployment:</Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Azure App Service:</strong> Hosts the application on
                Microsoft's cloud computing service for secure and scalable web
                application deployment.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h2">Function Availability</Typography>
          <Typography variant="h4">Currently Disabled Functions:</Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Add Strategy:</strong> The ability to add new trading
                strategies is currently disabled.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Run Backtesting:</strong> Running backtesting for
                strategies is not available.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Add Pair Group:</strong> The functionality to add new
                pair groups has been disabled.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Show Backtesting Result for Each Strategy:</strong>{" "}
                Detailed backtesting results for individual strategies are not
                currently displayed.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h4">Available Functions: </Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Strategy Analysis Using AI Service:</strong> Deeply
                analyze strategies using advanced AI tools to provide
                comprehensive insights.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Backtesting Batch Results:</strong> View results from
                batch backtests to compare the performance of multiple
                strategies.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Pair Group Management:</strong> Manage and configure
                pair groups that are essential for strategy execution.
              </Typography>
            </ListItem>
          </List>
          <Typography variant="h3">Contact Me</Typography>
          <IconButton
            href="www.maobui.online"
            target="_blank"
            className="icon-button"
          >
            <WebIcon />
          </IconButton>
          <IconButton
            href="https://www.linkedin.com/in/mao-bui-nguyen/"
            target="_blank"
            rel="noreferrer"
            className="icon-button"
          >
            <LinkedInIcon />
          </IconButton>
          <IconButton
            href="mailto:maonguyen199873@gmail.com"
            className="icon-button"
          >
            <EmailIcon />
          </IconButton>
          <IconButton
            href="https://www.upwork.com/freelancers/maob4"
            target="_blank"
            rel="noreferrer"
            className="icon-button"
          >
            <img src={upw} alt="Upwork" width={25}/>
          </IconButton>
          <IconButton
            href="https://github.com/MaoBui2907"
            target="_blank"
            rel="noreferrer"
            className="icon-button"
          >
            <GitHubIcon />
          </IconButton>
          <Typography variant="h3">Resources</Typography>
          <Typography variant="body1">
            <strong>Open Source Strategies Repository:</strong>&nbsp;
            <IconButton
              href="https://github.com/MaoBui2907/freqtrade-strategies"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Typography>
          <Typography variant="body1">
            <strong>FreqTrade Documentation: </strong> &nbsp;
            <IconButton
              href="https://www.freqtrade.io/en/stable/"
              target="_blank"
              rel="noreferrer"
            >
              <LinkIcon />
            </IconButton>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Helper;
