import logo from './logo.svg';
import './App.css';
import SmartBox from './SmartBox';

function App() {
    return (
        <div className="App">
            <header className="App-header">
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
            <SmartBox angle={0} disableDragging disableSizing={["left-top", "left-bottom", 'right', "left", 'bottom', 'right-top', 'top']}>
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
            <SmartBox angle={0}>
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
