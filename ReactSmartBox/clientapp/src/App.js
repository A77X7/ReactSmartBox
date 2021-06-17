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
            <SmartBox angle={0}>
                <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <img src={logo} className="App-logo" alt="logo" style={{ height: "80%", width: "100%" }} />
                    <div style={{ height: "20%" }}>SmartBox</div>
                </div>
            </SmartBox>
        </div>
    );
}

export default App;
