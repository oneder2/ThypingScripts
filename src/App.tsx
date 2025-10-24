import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>ThypingScripts</h1>
      <div className="card">
        <p>
          一个基于Tauri 2.0的跨平台桌面编剧工具，专注于简化的写作体验，支持Fountain格式。
        </p>
        <button onClick={() => setCount((count) => count + 1)}>
          点击次数: {count}
        </button>
      </div>
    </div>
  );
}

export default App;
