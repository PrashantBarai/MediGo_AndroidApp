import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  count: number;
}

export default function Categories() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Nutritional Drinks',
      icon: 'cup',
      color: '#FFE0E0',
      count: 0
    },
    {
      id: '2',
      name: 'Ayurveda',
      icon: 'leaf',
      color: '#E0FFE0',
      count: 0
    },
    {
      id: '3',
      name: 'Vitamins',
      icon: 'pill',
      color: '#E0E0FF',
      count: 0
    },
    {
      id: '4',
      name: 'Healthcare',
      icon: 'heart-pulse',
      color: '#FFE0FF',
      count: 0
    },
    {
      id: '5',
      name: 'Personal Care',
      icon: 'face-man',
      color: '#E0FFFF',
      count: 0
    },
    {
      id: '6',
      name: 'Baby Care',
      icon: 'baby-face',
      color: '#FFFFE0',
      count: 0
    }
  ]);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://192.168.1.102:8082/api/products/category-counts');
        if (!response.ok) {
          throw new Error('Failed to fetch category counts');
        }
        
        const data = await response.json();
        console.log('Received category counts:', data);
        
        setCategories(prev => prev.map(category => ({
          ...category,
          count: data[category.name] || 0
        })));
      } catch (err) {
        console.error('Error fetching category counts:', err);
        setError('Failed to load category counts');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: "/(customer)/products/[id]",
      params: { id: categoryId }
    });
  };

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // 48 = padding (16) * 2 + gap between cards (16)

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#6C63FF', padding: 16, paddingTop: 48 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '600' }}>Categories</Text>
            <Text style={{ color: '#FFFFFF99', marginTop: 4 }}>Find products by category</Text>
          </View>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FFFFFF20', 
              padding: 8, 
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => router.push('/profile/notifications')}
          >
            <MaterialCommunityIcons name="bell" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={{ 
          backgroundColor: 'white', 
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: -24,
          height: 48,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <MaterialCommunityIcons name="magnify" size={24} color="#9E9E9E" />
          <TextInput
            placeholder="Search categories"
            style={{ flex: 1, marginLeft: 12, fontSize: 16 }}
            placeholderTextColor="#9E9E9E"
          />
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={{
                  width: cardWidth,
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={{
                  width: 64,
                  height: 64,
                  backgroundColor: category.color,
                  borderRadius: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <MaterialCommunityIcons name={category.icon} size={32} color="#6C63FF" />
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  textAlign: 'center',
                  marginBottom: 4,
                }}>
                  {category.name}
                </Text>
                <Text style={{ color: '#666', fontSize: 13 }}>
                  {category.count} Products
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
} 