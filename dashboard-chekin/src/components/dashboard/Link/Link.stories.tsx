import React from 'react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {Link} from './Link';

const story = {
  component: Link,
  title: 'Base/Dashboard/Link',
  decorators: [withKnobs],
};

export const main = () => (
  <Link
    label={text('Label', 'Label')}
    to={text('Url', 'Url')}
    blank={boolean('Blank', true)}
  />
);

export default story;
