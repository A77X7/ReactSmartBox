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
            <SmartBox>
                <img src={logo} className="App-logo" alt="logo" style={{ height: "100%", width: "100%" }} />
            </SmartBox>
        </div>
    );
}

export default App;
