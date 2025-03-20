import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { addItem } from '../../redux/slices/cartSlice';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { placeholderImageBase64 } from '../../../assets/placeholder';

// Define the types for navigation and route
type RootStackParamList = {
  ProductDetails: { product: Product };
  Cart: undefined;
};

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

type Props = {
  route: ProductDetailsRouteProp;
  navigation: ProductDetailsNavigationProp;
};

// Product Type definition
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  manufacturer: string;
  category: string;
  requiresPrescription: boolean;
  inStock: boolean;
  rating: number;
};

const ProductDetails: React.FC<Props> = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    dispatch(addItem({ 
      id: product.id,
      name: product.name,
      price: product.price,
      quantity
    }));
    navigation.navigate('Cart');
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: product.image || placeholderImageBase64 }} 
        style={styles.image} 
      />
      
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.manufacturer}>By {product.manufacturer}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {product.rating}/5</Text>
        </View>
        
        {product.requiresPrescription && (
          <View style={styles.prescriptionBadge}>
            <Text style={styles.prescriptionText}>Requires Prescription</Text>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>
        
        <Text style={styles.sectionTitle}>Category</Text>
        <Text style={styles.category}>{product.category}</Text>
        
        <Text style={styles.sectionTitle}>Availability</Text>
        <Text style={styles.stock}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Text>
        
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.addToCartButton, 
            !product.inStock && styles.disabledButton
          ]} 
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Text style={styles.addToCartText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  manufacturer: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    color: '#FFA000',
    fontWeight: 'bold',
  },
  prescriptionBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  prescriptionText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  stock: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#E0E0E0',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  addToCartButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetails;
