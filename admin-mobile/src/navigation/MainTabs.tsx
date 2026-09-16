import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, FolderOpen, Package, Mail } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/theme';
import { useNotifications } from '../contexts/NotificationContext';

import DashboardScreen from '../screens/DashboardScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryFormScreen from '../screens/CategoryFormScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import InquiriesScreen from '../screens/InquiriesScreen';

// --- Stack param lists ---
export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryForm: { id?: string };
};

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductForm: { id?: string };
};

export type InquiriesStackParamList = {
  InquiriesList: undefined;
};

// --- Stack Navigators ---
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const InquiriesStack = createNativeStackNavigator<InquiriesStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: Colors.bgApp },
};

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
    </DashboardStack.Navigator>
  );
}

function CategoriesStackScreen() {
  return (
    <CategoriesStack.Navigator screenOptions={screenOptions}>
      <CategoriesStack.Screen name="CategoriesList" component={CategoriesScreen} />
      <CategoriesStack.Screen name="CategoryForm" component={CategoryFormScreen} />
    </CategoriesStack.Navigator>
  );
}

function ProductsStackScreen() {
  return (
    <ProductsStack.Navigator screenOptions={screenOptions}>
      <ProductsStack.Screen name="ProductsList" component={ProductsScreen} />
      <ProductsStack.Screen name="ProductForm" component={ProductFormScreen} />
    </ProductsStack.Navigator>
  );
}

function InquiriesStackScreen() {
  return (
    <InquiriesStack.Navigator screenOptions={screenOptions}>
      <InquiriesStack.Screen name="InquiriesList" component={InquiriesScreen} />
    </InquiriesStack.Navigator>
  );
}

import { BottomTabBar } from '@react-navigation/bottom-tabs';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { DeviceEventEmitter } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

function CustomTabBar(props: any) {
  const { state, descriptors } = props;
  const currentRoute = state.routes[state.index];
  const { options } = descriptors[currentRoute.key];
  
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('toggleTabBar', (visible) => {
      translateY.value = withSpring(visible ? 0 : 120, {
        damping: 20,
        stiffness: 150,
        mass: 0.5,
      });
    });
    return () => sub.remove();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    };
  });

  if (options.tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

function getTabBarVisibility(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  if (routeName === 'CategoryForm' || routeName === 'ProductForm') {
    return { display: 'none' };
  }
  return styles.tabBar;
}

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { unreadCount } = useNotifications();
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconProps = { size: 22, color, strokeWidth: focused ? 2.2 : 1.8 };
          switch (route.name) {
            case 'Dashboard':
              return <LayoutDashboard {...iconProps} />;
            case 'Categories':
              return <FolderOpen {...iconProps} />;
            case 'Products':
              return <Package {...iconProps} />;
            case 'Inquiries':
              return <Mail {...iconProps} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, styles.tabBarOverlay]} />
          </View>
        ),
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStackScreen} 
        options={{ tabBarStyle: styles.tabBar }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesStackScreen} 
        options={({ route }) => ({
          tabBarStyle: getTabBarVisibility(route)
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Categories', { screen: 'CategoriesList' });
          }
        })}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsStackScreen} 
        options={({ route }) => ({
          tabBarStyle: getTabBarVisibility(route)
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Products', { screen: 'ProductsList' });
          }
        })}
      />
      <Tab.Screen 
        name="Inquiries" 
        component={InquiriesStackScreen} 
        options={{ 
          tabBarStyle: styles.tabBar,
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.primary, color: Colors.bgApp, fontSize: 10, fontWeight: 'bold' }
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderRadius: 999, // Pill shape
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.2)',
    borderTopWidth: 1, // Override default top border
    borderTopColor: 'rgba(200, 169, 110, 0.2)',
    backgroundColor: 'transparent',
    elevation: 0, // Handled by Animated.View wrapper
    height: 65,
    paddingBottom: 0,
    paddingTop: 0,
    overflow: 'hidden', // Clips the BlurView to the pill shape
  },
  tabBarItem: {
    paddingVertical: 10,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  tabBarOverlay: {
    backgroundColor: 'rgba(10, 10, 11, 0.7)',
  },
});
