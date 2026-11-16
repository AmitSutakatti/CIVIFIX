import { Image } from 'react-native';

export default function BrandLogo({ size = 44, style }) {
  return (
    <Image
      source={require('../../assets/civicfix-logo.png')}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessible
      accessibilityLabel="CivicFix user"
    />
  );
}
