import "./App.css";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import GeneratedContent from "./components/generated-content/generated-content.component";
import GeneratedConfig from "./components/generator-config/generator-config.component";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>SimStarter - The Sims house starter</p>
      </header>
      <GeneratedConfig />
      <GeneratedContent />
    </div>
  );
}

export default App;
