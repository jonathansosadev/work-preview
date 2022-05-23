/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";

function DarkFooter() {
  return (
    <footer className="footer" data-background-color="black">
      <Container>
        <nav>
          <ul>
            <li>
              <a
                target="_blank"
              >
                ENSO
              </a>
            </li>
            <li>
              <a
                target="_blank"
              >
                Sobre nosotros
              </a>
            </li>
            <li>
              <a
                target="_blank"
              >
                Blog
              </a>
            </li>
          </ul>
        </nav>
        <div className="copyright" id="copyright">
          © {new Date().getFullYear()}, Designed by{" "}
          <a
            href="#"
          >
            ENSO
          </a>
          .
        </div>
      </Container>
    </footer>
  );
}

export default DarkFooter;
