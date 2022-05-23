/*eslint-disable*/
import React from "react";

// reactstrap components
import { Container } from "reactstrap";

function TransparentFooter() {
  return (
    <footer className="footer">
      <Container>
        {/* <nav>
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
        </nav> */}
        <div className="copyright" id="copyright">
          © {new Date().getFullYear()}, Diseñado por ENSO.{" "}
          {/* <a
            href="#"
          >
            ENSO
          </a> */}
        </div>
      </Container>
    </footer>
  );
}

export default TransparentFooter;
