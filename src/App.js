import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Navbar, Nav
} from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Category from './Category';
import Journal from './Journal'

function App() {
  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="/">Money Journey</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#journal">Journal</Nav.Link>
            <Nav.Link href="#category">Category</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path="/journal">
          <Journal />
        </Route>
        <Route path="/category">
          <Category />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}



function Home() {
  return (
    <div style={{ "marginTop": 1 + '%' }}>
      <Container>
        <h1>Home</h1>
      </Container>
    </div>
  )
}
export default App;
