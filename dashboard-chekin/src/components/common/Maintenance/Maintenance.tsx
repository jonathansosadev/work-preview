import React from 'react';
import {Container, Title, Description, Illustration} from './styled';

function Maintenance() {
  return (
    <Container>
      <Illustration />
      <Title>Sorry, we are down for scheduled maintenance</Title>
      <Description>
        Unfortunately the site is down for a maintenance right now.
        <div>
          We'll be up around <b>12 AM UTC</b>.
        </div>
      </Description>
    </Container>
  );
}

export {Maintenance};
