import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, ToastAndroid } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  totalReviews: number;
  description: string;
  longDescription: string;
  manufacturer: string;
  category: string;
  inStock: boolean;
  image?: string;
  discount?: {
    percentage: number;
    validUntil: string;
  };
  highlights: string[];
  keyIngredients: string[];
  // Additional fields matching pharmacy input
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  prescriptionRequired: boolean;
  sideEffects: string[];
  dosage: string;
  storage: string;
}

const PRODUCTS: Record<string, Product> = {
  '1': { 
    id: '1', 
    name: 'Horlicks Health Drink', 
    price: 299, 
    rating: 4.5,
    totalReviews: 1248,
    description: 'Classic Malt • 500g Jar',
    longDescription: "Horlicks Health Drink is a nourishing malted milk beverage that has been trusted by families for generations. Made with the goodness of wheat, barley and malted milk, it is scientifically proven to support children's growth and development.",
    manufacturer: 'GSK Consumer Healthcare',
    category: 'Nutritional Drinks',
    inStock: true,
    discount: {
      percentage: 15,
      validUntil: '2024-03-31'
    },
    highlights: [
      'Clinically proven growth formula',
      'Rich in essential nutrients',
      'Supports immunity',
      'Helps in better concentration'
    ],
    keyIngredients: [
      'Wheat',
      'Malted Barley',
      'Milk Solids',
      'Sugar',
      'Minerals',
      'Vitamins'
    ],
    batchNumber: 'HLK2024001',
    expiryDate: '2024-12',
    quantity: 50,
    prescriptionRequired: false,
    sideEffects: [
      'Generally safe for consumption',
      'May cause allergic reactions in some individuals'
    ],
    dosage: '2 tablespoons (30g) in 200ml hot or cold milk, twice daily',
    storage: 'Store in a cool, dry place. Keep container tightly closed after use.'
  }
  // ... other products
} as const;

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const product = PRODUCTS[id as string];
  const screenWidth = Dimensions.get('window').width;
  const [isInCart, setIsInCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const handleCartAction = () => {
    setIsInCart(!isInCart);
    ToastAndroid.show(
      isInCart ? 'Removed from cart' : 'Added to cart',
      ToastAndroid.SHORT
    );
  };

  const renderDefaultIcon = () => (
    <View style={{
      width: screenWidth * 0.4,
      height: screenWidth * 0.4,
      backgroundColor: '#6C63FF15',
      borderRadius: screenWidth * 0.2,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <MaterialCommunityIcons 
        name={product.category === 'Nutritional Drinks' ? 'bottle-tonic' : 'pill'} 
        size={screenWidth * 0.25} 
        color="#6C63FF" 
      />
    </View>
  );

  // Reset image error state when product changes
  useEffect(() => {
    setImageError(false);
  }, [product.id]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Section */}
        <View style={{ 
          backgroundColor: '#6C63FF10',
          height: screenWidth * 0.8,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          {/* Back Button */}
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 48,
              left: 16,
              backgroundColor: 'white',
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
              zIndex: 1
            }}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <Animated.View 
            entering={FadeIn}
            style={{
              width: screenWidth * 0.6,
              height: screenWidth * 0.6,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {product.image && !imageError ? (
              <Image 
                source={{ uri: product.image }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            ) : renderDefaultIcon()}
          </Animated.View>

          {product.prescriptionRequired && (
            <View style={{
              position: 'absolute',
              top: 48,
              right: 16,
              backgroundColor: '#FF525215',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4
            }}>
              <MaterialCommunityIcons name="prescription" size={16} color="#FF5252" />
              <Text style={{ color: '#FF5252', fontSize: 12, fontWeight: '600' }}>
                Prescription Required
              </Text>
            </View>
          )}
        </View>

        {/* Product Info Section */}
        <View style={{ padding: 20 }}>
          <Animated.View entering={FadeInDown.delay(200)}>
            {/* Title and Basic Info */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '700', 
                color: '#1A1A1A', 
                marginBottom: 4,
                flexWrap: 'wrap' 
              }}>
                {product.name}
              </Text>
              <Text style={{ 
                fontSize: 16, 
                color: '#666666', 
                marginBottom: 12,
                flexWrap: 'wrap'
              }}>
                {product.description}
              </Text>
              
              {/* Ratings and Reviews */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                gap: 8, 
                marginBottom: 12 
              }}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  backgroundColor: '#F0FDF4',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <MaterialIcons name="star" size={16} color="#22C55E" />
                  <Text style={{ marginLeft: 4, color: '#22C55E', fontWeight: '600' }}>
                    {product.rating}
                  </Text>
                </View>
                <Text style={{ color: '#666666' }}>
                  {product.totalReviews.toLocaleString()} reviews
                </Text>
                <Text style={{ color: '#666666' }}>•</Text>
                <Text style={{ 
                  color: '#666666',
                  flex: 1,
                  flexWrap: 'wrap'
                }}>
                  {product.manufacturer}
                </Text>
              </View>

              {/* Stock and Batch Info */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <View style={{
                  backgroundColor: product.inStock ? '#F0FDF4' : '#FEE2E2',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <MaterialIcons 
                    name={product.inStock ? 'check-circle' : 'error'} 
                    size={16} 
                    color={product.inStock ? '#22C55E' : '#DC2626'} 
                  />
                  <Text style={{ 
                    color: product.inStock ? '#22C55E' : '#DC2626',
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    {product.inStock ? `${product.quantity} in stock` : 'Out of Stock'}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#F1F5F9',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <MaterialIcons name="info" size={16} color="#64748B" />
                  <Text style={{ color: '#64748B', fontSize: 12 }}>
                    Batch: {product.batchNumber}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#F1F5F9',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <MaterialIcons name="event" size={16} color="#64748B" />
                  <Text style={{ color: '#64748B', fontSize: 12 }}>
                    Expires: {product.expiryDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Section */}
            <View style={{ 
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 16,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#6C63FF' }}>
                  ₹{product.price}
                </Text>
                {product.discount && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Text style={{ 
                      color: '#666666', 
                      fontSize: 16, 
                      textDecorationLine: 'line-through' 
                    }}>
                      ₹{Math.round(product.price * (1 + product.discount.percentage/100))}
                    </Text>
                    <View style={{
                      backgroundColor: '#FF525215',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8
                    }}>
                      <Text style={{ color: '#FF5252', fontWeight: '600' }}>
                        {product.discount.percentage}% OFF
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={{
                  backgroundColor: isInCart ? '#FF5252' : '#6C63FF',
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onPress={handleCartAction}
                disabled={!product.inStock}
              >
                <MaterialCommunityIcons 
                  name={isInCart ? 'cart-remove' : 'cart-plus'} 
                  size={24} 
                  color="white" 
                />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {!product.inStock 
                    ? 'Out of Stock' 
                    : isInCart 
                      ? 'Remove from Cart' 
                      : 'Add to Cart'
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dosage Section */}
            {product.dosage && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
                  Dosage Instructions
                </Text>
                <View style={{
                  backgroundColor: '#F8F9FA',
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  gap: 12
                }}>
                  <MaterialCommunityIcons name="clock-time-four" size={24} color="#6C63FF" />
                  <Text style={{ flex: 1, color: '#666666', fontSize: 15, lineHeight: 24 }}>
                    {product.dosage}
                  </Text>
                </View>
              </View>
            )}

            {/* Storage Instructions */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
                Storage Instructions
              </Text>
              <View style={{
                backgroundColor: '#F8F9FA',
                padding: 16,
                borderRadius: 12,
                flexDirection: 'row',
                gap: 12
              }}>
                <MaterialCommunityIcons name="thermometer" size={24} color="#6C63FF" />
                <Text style={{ flex: 1, color: '#666666', fontSize: 15, lineHeight: 24 }}>
                  {product.storage}
                </Text>
              </View>
            </View>

            {/* Side Effects */}
            {product.sideEffects && product.sideEffects.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
                  Side Effects
                </Text>
                <View style={{ gap: 8 }}>
                  {product.sideEffects.map((effect, index) => (
                    <View key={index} style={{ 
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FEF2F2',
                      padding: 12,
                      borderRadius: 12,
                      gap: 12
                    }}>
                      <MaterialIcons name="warning" size={20} color="#DC2626" />
                      <Text style={{ flex: 1, color: '#DC2626', fontSize: 14 }}>
                        {effect}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Product Highlights */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
                Highlights
              </Text>
              <View style={{ gap: 8 }}>
                {product.highlights.map((highlight, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ 
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#6C63FF10',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <MaterialCommunityIcons name="check" size={20} color="#6C63FF" />
                    </View>
                    <Text style={{ flex: 1, color: '#666666', fontSize: 15 }}>
                      {highlight}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Key Ingredients */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
                Key Ingredients
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {product.keyIngredients.map((ingredient, index) => (
                  <View 
                    key={index}
                    style={{
                      backgroundColor: '#6C63FF10',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <MaterialCommunityIcons name="molecule" size={16} color="#6C63FF" />
                    <Text style={{ color: '#6C63FF' }}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 }}>
                Description
              </Text>
              <Text style={{ color: '#666666', fontSize: 15, lineHeight: 24 }}>
                {product.longDescription}
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
} 