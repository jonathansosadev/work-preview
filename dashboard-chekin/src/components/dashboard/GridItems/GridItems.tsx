import React from 'react';
import {Grid, Title, PlaceholderContainer, Container} from './styled';

type GridItemsProps = {
  title?: string;
  children?: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
};

const GridItems = React.forwardRef<HTMLDivElement, GridItemsProps>(
  ({children, title, placeholder, className}, ref) => {
    return (
      <Container ref={ref} className={className}>
        {title && <Title>{title}</Title>}
        <Grid>
          {children}
          <PlaceholderContainer>{placeholder}</PlaceholderContainer>
        </Grid>
      </Container>
    );
  },
);

export {GridItems};
