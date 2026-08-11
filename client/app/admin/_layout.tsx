import { Stack } from 'expo-router';

const AdminLayout = () => (
  <Stack
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#fafafa' },
    }}
  >
    <Stack.Screen name="index" />
    <Stack.Screen name="products" />
    <Stack.Screen name="orders" />
    <Stack.Screen name="stock" />
    <Stack.Screen name="staff" />
    <Stack.Screen name="settings" />
    <Stack.Screen name="tenants" />
    <Stack.Screen name="banners" />
    <Stack.Screen name="audit" />
  </Stack>
);

export default AdminLayout;
