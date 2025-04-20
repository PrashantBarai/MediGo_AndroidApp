import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  description: string;
  image?: string;
  inStock: boolean;
  manufacturer: string;
  category: string;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

const PRODUCTS: Record<string, Product[]> = {
  '1': [
    { 
      id: '1', 
      name: 'Horlicks Health Drink', 
      price: 299, 
      rating: 4.5, 
      description: 'Classic Malt • 500g Jar',
      manufacturer: 'GSK Consumer Healthcare',
      category: 'Nutritional Drinks',
      inStock: true,
      discount: {
        percentage: 15,
        validUntil: '2024-03-31'
      }
    },
    { 
      id: '2', 
      name: 'Boost Energy Drink', 
      price: 275, 
      rating: 4.3, 
      description: 'Chocolate Flavor • 750g Jar',
      manufacturer: 'GSK Consumer Healthcare',
      category: 'Nutritional Drinks',
      inStock: true
    },
    { 
      id: '3', 
      name: 'Ensure Complete Nutrition', 
      price: 599, 
      rating: 4.7, 
      description: 'Vanilla Flavor • 400g Pack',
      manufacturer: 'Abbott Healthcare',
      category: 'Nutritional Drinks',
      inStock: false
    },
  ],
  '2': [
    { 
      id: '1', 
      name: 'Organic Ashwagandha', 
      price: 199, 
      rating: 4.4, 
      description: '60 Tablets • 500mg',
      manufacturer: 'Himalaya Wellness',
      category: 'Ayurveda',
      inStock: true,
      discount: {
        percentage: 20,
        validUntil: '2024-03-31'
      }
    },
    { 
      id: '2', 
      name: 'Dabur Chyawanprash', 
      price: 350, 
      rating: 4.6, 
      description: 'Immunity Booster • 1kg',
      manufacturer: 'Dabur India Ltd',
      category: 'Ayurveda',
      inStock: true
    },
    { 
      id: '3', 
      name: 'Patanjali Giloy Tablets', 
      price: 150, 
      rating: 4.2, 
      description: '60 Tablets • Natural',
      manufacturer: 'Patanjali Ayurved',
      category: 'Ayurveda',
      inStock: true
    },
  ],
};

export default function ProductsScreen() {
  const { id: categoryId } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating'>('popular');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = 'http://192.168.1.101:8082/api/products';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('Fetched products:', data);
        
        // Transform the data to match our Product interface
        const transformedProducts = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          price: parseFloat(item.price.replace('₹', '')),
          rating: item.rating || 0,
          description: item.description,
          manufacturer: item.manufacturer,
          category: item.category,
          inStock: item.stock > 0,
          image: item.images && item.images.length > 0 ? item.images[0] : undefined,
          discount: item.discount ? {
            percentage: item.discount.percentage || 0,
            validUntil: item.discount.validUntil ? new Date(item.discount.validUntil).toISOString().split('T')[0] : ''
          } : undefined
        }));
        
        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check your connection.');
        // Fallback to static products if API fails
        setProducts(PRODUCTS[categoryId as string] || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryId]);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 32) / 2;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // Keep original order for popular
    }
  });

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: "/(customer)/products/details/[id]",
      params: { id: productId }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF', 
        paddingTop: 48,
        paddingBottom: 80,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 24
        }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FFFFFF20',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '600', marginLeft: 16 }}>Products</Text>
        </View>

        {/* Search Bar */}
        <View style={{ 
          marginHorizontal: 16,
          backgroundColor: 'white',
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: 56,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <MaterialIcons name="search" size={24} color="#9E9E9E" />
          <TextInput
            placeholder="Search medicines, health drinks..."
            placeholderTextColor="#9E9E9E"
            style={{ 
              flex: 1, 
              marginLeft: 12, 
              fontSize: 16,
              color: '#1A1A1A'
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={24} color="#9E9E9E" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Sort Options */}
      <View style={{ marginTop: -40 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            gap: 8
          }}
        >
          {[
            { key: 'popular', label: 'Popular', icon: 'trending-up' },
            { key: 'price', label: 'Price: Low to High', icon: 'payments' },
            { key: 'rating', label: 'Highest Rated', icon: 'star' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={{
                backgroundColor: sortBy === option.key ? '#FFF9C4' : 'white',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 24,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => setSortBy(option.key as typeof sortBy)}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={16} 
                color={sortBy === option.key ? '#FFB300' : '#666'} 
              />
              <Text style={{ 
                color: sortBy === option.key ? 'black' : '#666',
                fontWeight: '500',
                fontSize: 14
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <ScrollView
        style={{ flex: 1, marginTop: 16 }}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingBottom: 16
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : sortedProducts.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <MaterialCommunityIcons name="bottle-tonic" size={48} color="#9E9E9E" />
            <Text style={{ color: '#666', marginTop: 8, fontSize: 16 }}>No products found</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {sortedProducts.map((product, index) => (
              <Animated.View
                key={product.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  onPress={() => handleProductPress(product.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row' }}>
                    {/* Product Image */}
                    <View style={{
                      width: 100,
                      height: 100,
                      backgroundColor: '#F8F9FA',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}>
                      {product.image ? (
                        <Image 
                          source={{ uri: product.image }} 
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <MaterialCommunityIcons 
                          name={product.category === 'Nutritional Drinks' ? 'bottle-tonic' : 'pill'} 
                          size={48} 
                          color="#6C63FF" 
                        />
                      )}
                      {product.discount && (
                        <View style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: '#FF5252',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8
                        }}>
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                            {product.discount.percentage}% OFF
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Product Info */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text 
                        numberOfLines={1} 
                        style={{ 
                          fontSize: 18, 
                          fontWeight: '600',
                          color: '#1A1A1A',
                          marginBottom: 4
                        }}
                      >
                        {product.name}
                      </Text>

                      <Text 
                        numberOfLines={1} 
                        style={{ 
                          color: '#666666',
                          fontSize: 14,
                          marginBottom: 4
                        }}
                      >
                        {product.description}
                      </Text>

                      {/* Manufacturer & Rating */}
                      <Text style={{ 
                        color: '#666666', 
                        fontSize: 14,
                        marginBottom: 4
                      }}>
                        {product.manufacturer}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialIcons name="star" size={16} color="#22C55E" />
                        <Text style={{ 
                          marginLeft: 4, 
                          color: '#22C55E', 
                          fontSize: 14,
                          fontWeight: '500'
                        }}>
                          {product.rating}
                        </Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={{ color: '#6C63FF', fontSize: 18, fontWeight: '700' }}>₹{product.price}</Text>
                          {product.discount && (
                            <Text style={{ 
                              color: '#666666', 
                              fontSize: 12, 
                              textDecorationLine: 'line-through' 
                            }}>
                              ₹{Math.round(product.price * (1 + product.discount.percentage/100))}
                            </Text>
                          )}
                        </View>
                        {!product.inStock ? (
                          <Text style={{ color: '#FF5252', fontSize: 12, fontWeight: '500' }}>Out of Stock</Text>
                        ) : (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#6C63FF',
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <MaterialCommunityIcons name="plus" size={20} color="white" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
} 