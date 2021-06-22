import logo from './logo.svg';
import './App.css';
import SmartBox from './SmartBox';

function App() {
    return (
        <div className="App" style={{ left: "100px", top: "100px", position: "relative", width: "400px", height: "400px", backgroundColor: "aliceblue" }}>
            <header className="App-header" style={{ minHeight: 0, backgroundColor: "transparent" }}>
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <SmartBox defaultAngle={0} disableVerticalDragging disableSizing={["left-top", "left-bottom", 'right', "left", 'bottom', 'right-top', 'top']} handleSizePx={0}>
                <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <input style={{ height: "15%", width: "80%" }} onFocus={e => console.log("focus")} onMouseDown={e => {
                        console.log("down on input", e);
                        //e.preventDefault();
                        //e.stopPropagation();

                    }} />
                    <img src={logo} className="App-logo" alt="logo" style={{ height: "70%", width: "100%" }} />
                    <div style={{ height: "15%" }}>SmartBox</div>
                </div>
            </SmartBox>
            <SmartBox defaultAngle={0} onSizingEnd={(e, s) => {
                console.log("sized", s, e);
            }}>
                <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <img src={logo} className="App-logo" alt="logo" style={{ height: "70%", width: "100%" }} />
                    <div style={{ height: "15%" }}>SmartBox</div>
                    <button style={{ height: "15%", width: "80%" }} onClick={e => console.log("click", e)} onMouseUp={e => {
                        console.log("up on button", e);
                    }} />
                </div>
            </SmartBox>
        </div>
    );
}

export default App;
