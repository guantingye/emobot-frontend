import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MoodInput from "./components/MoodInput";
import MemberDashboard from "./components/MemberDashboard";
import TestEntry from "./components/TestEntry";
import TestStep1 from "./components/TestStep1";
import TestStep2 from "./components/TestStep2";
import TestStep3 from "./components/TestStep3";
import TestStep4 from "./components/TestStep4";
import TestStep5 from "./components/TestStep5";
import MatchingProgress from "./components/MatchingProgress";
import MatchResult from "./components/MatchResult";
import Home from "./components/Home";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* 主頁 */}
        <Route path="/Home" element={<Home />} />
        <Route path="/Login" element={<Login />} />

        {/* 測驗流程 */}
        <Route path="/test" element={<TestEntry />} />
        <Route path="/test/step1" element={<TestStep1 />} />
        <Route path="/test/step2" element={<TestStep2 />} />
        <Route path="/test/step3" element={<TestStep3 />} />
        <Route path="/test/step4" element={<TestStep4 />} />
        <Route path="/test/step5" element={<TestStep5 />} />

        {/* 媒合流程 */}
        <Route path="/match/progress" element={<MatchingProgress />} />
        <Route path="/match/result" element={<MatchResult />} />

        {/* 其他功能頁 */}
        <Route path="/mood" element={<MoodInput />} />
        <Route path="/dashboard" element={<MemberDashboard />} />

        {/* 萬用 fallback：請務必放在最後 */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;


