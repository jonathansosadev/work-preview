import React from 'react';
import {Section} from './Section';

const story = {
  component: Section,
  title: 'Base/Dashboard/Section',
};

export const main = () => (
  <Section title="Test title" subtitle="Test subtitle" subtitleTooltip="TooltipContent">
    Test
  </Section>
);

export default story;
