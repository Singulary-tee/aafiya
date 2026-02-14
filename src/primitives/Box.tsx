
import { View, ViewProps } from 'react-native';
import React from 'react';

// For now, Box is a simple pass-through to View.
// We will enhance it later to directly take theme-based props
// (e.g., <Box padding="md" backgroundColor="surface">)

export type BoxProps = ViewProps;

const Box: React.FC<BoxProps> = (props) => {
  return <View {...props} />;
};

export default Box;
