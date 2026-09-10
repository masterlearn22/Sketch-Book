import { MengToSketchbookLandingPage } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function App() {
  return (
    <div className="shader-frame" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <MengToSketchbookLandingPage
        headingFont="instrument-serif"
        bodyFont="newsreader"
        headingWeight="400"
        bodyWeight="400"
        primaryColor="#2b2721"
        headingSize={30}
        bodySize={20}
        headingLetterSpacing={0.010}
      />
    </div>
  );
}
