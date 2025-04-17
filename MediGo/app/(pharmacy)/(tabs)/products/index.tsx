import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  manufacturer: string;
  manufacturingDate: string;
  prescriptionRequired: boolean;
  ingredients: string[];
  dosage: string;
  sideEffects?: string;
  storageInstructions?: string;
  images: string[];
  discount: {
    percentage?: number;
    validUntil?: string;
  };
  rating: number;
  reviews: number;
}

const PRODUCTS: Product[] = [
  {
    id: 'PRD001',
    name: 'Paracetamol 500mg',
    description: 'Pain relief tablets for headache and fever',
    price: '₹49.99',
    stock: 150,
    category: 'Tablets',
    manufacturer: 'Cipla Ltd',
    manufacturingDate: '2023-01-15',
    prescriptionRequired: false,
    ingredients: ['Paracetamol 500mg'],
    dosage: '1 tablet every 4-6 hours',
    sideEffects: 'Rare cases of skin rashes',
    storageInstructions: 'Store in a cool, dry place',
    images: [],
    discount: {
      percentage: 10,
      validUntil: '2024-06-30'
    },
    rating: 4.5,
    reviews: 120
  },
  {
    id: 'PRD002',
    name: 'Vitamin C 1000mg',
    description: 'Immunity booster',
    price: '₹299.99',
    stock: 75,
    category: 'Supplements',
    manufacturer: 'Pfizer',
    manufacturingDate: '2023-01-15',
    prescriptionRequired: false,
    ingredients: ['Vitamin C 1000mg'],
    dosage: '1 tablet daily',
    sideEffects: 'Rare cases of stomach upset',
    storageInstructions: 'Store in a cool, dry place',
    images: [],
    discount: {
      percentage: 5,
      validUntil: '2025-06-30'
    },
    rating: 4.2,
    reviews: 80
  },
  {
    id: 'PRD003',
    name: 'Blood Glucose Monitor',
    description: 'Digital meter',
    price: '₹1499.99',
    stock: 25,
    category: 'Devices',
    manufacturer: 'Medtronic',
    manufacturingDate: '2023-01-15',
    prescriptionRequired: false,
    ingredients: [],
    dosage: '',
    sideEffects: '',
    storageInstructions: 'Store in a cool, dry place',
    images: [],
    discount: {
      percentage: 20,
      validUntil: '2023-12-31'
    },
    rating: 4.8,
    reviews: 100
  },
  {
    id: 'PRD004',
    name: 'N95 Masks (Pack of 10)',
    description: 'Protective masks',
    price: '₹399.99',
    stock: 200,
    category: 'Protection',
    manufacturer: '3M',
    manufacturingDate: '2023-01-15',
    prescriptionRequired: false,
    ingredients: [],
    dosage: '',
    sideEffects: '',
    storageInstructions: 'Store in a cool, dry place',
    images: [],
    discount: {
      percentage: 15,
      validUntil: '2024-06-30'
    },
    rating: 4.7,
    reviews: 150
  },
  {
    id: 'PRD005',
    name: 'Cough Syrup 100ml',
    description: 'For dry cough relief',
    price: '₹89.99',
    stock: 45,
    category: 'Syrups',
    manufacturer: 'Bayer',
    manufacturingDate: '2023-01-15',
    prescriptionRequired: false,
    ingredients: ['Glycerin', 'Saccharin', 'Sodium Benzoate'],
    dosage: '1 teaspoon every 4 hours',
    sideEffects: 'Rare cases of stomach upset',
    storageInstructions: 'Store in a cool, dry place',
    images: [],
    discount: {
      percentage: 10,
      validUntil: '2024-06-30'
    },
    rating: 4.3,
    reviews: 70
  }
];

const CATEGORIES = [
  { label: 'All', icon: 'pill' },
  { label: 'Tablets', icon: 'pill' },
  { label: 'Syrups', icon: 'bottle-tonic' },
  { label: 'Devices', icon: 'medical-bag' },
  { label: 'Supplements', icon: 'pill' },
  { label: 'Protection', icon: 'shield-check' }
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<'manufacturingDate' | 'validUntil'>('manufacturingDate');
  const [dateInput, setDateInput] = useState('');
  const [date, setDate] = useState({
    day: '',
    month: '',
    year: ''
  });
  const [validUntilDate, setValidUntilDate] = useState({
    day: '',
    month: '',
    year: ''
  });

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setShowDetails(true);
  };

  const handleAddNew = () => {
    setSelectedProduct({
      id: `PRD${PRODUCTS.length + 1}`,
      name: '',
      description: '',
      price: '₹0.00',
      stock: 0,
      category: 'Tablets',
      manufacturer: '',
      manufacturingDate: '',
      prescriptionRequired: false,
      ingredients: [],
      dosage: '',
      sideEffects: '',
      storageInstructions: '',
      images: [],
      discount: {
        percentage: 0,
        validUntil: ''
      },
      rating: 0,
      reviews: 0
    });
    setIsAdding(true);
    setIsEditing(true);
    setShowDetails(true);
  };

  const handleSave = async () => {
    try {
      if (isAdding && selectedProduct) {
        // Add new product
        const newProduct: Product = {
          ...selectedProduct,
          id: `PRD${Date.now()}`, // Generate unique ID
          price: selectedProduct.price.replace('₹', ''), // Remove ₹ symbol
          stock: parseInt(selectedProduct.stock.toString()),
          manufacturingDate: `${date.year}-${date.month}-${date.day}`,
          discount: {
            percentage: selectedProduct.discount?.percentage || 0,
            validUntil: `${validUntilDate.year}-${validUntilDate.month}-${validUntilDate.day}`
          }
        };

        // Make API call to add product
        const response = await fetch('http://localhost:8082/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct),
        });

        if (!response.ok) {
          throw new Error('Failed to add product');
        }

        // Add to local state
        setProducts([...products, newProduct]);
      } else if (selectedProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...selectedProduct,
          price: selectedProduct.price.replace('₹', ''),
          stock: parseInt(selectedProduct.stock.toString()),
          manufacturingDate: `${date.year}-${date.month}-${date.day}`,
          discount: {
            percentage: selectedProduct.discount?.percentage || 0,
            validUntil: `${validUntilDate.year}-${validUntilDate.month}-${validUntilDate.day}`
          }
        };

        // Make API call to update product
        const response = await fetch(`http://localhost:8082/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProduct),
        });

        if (!response.ok) {
          throw new Error('Failed to update product');
        }

        // Update local state
        setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      }

      setIsAdding(false);
      setIsEditing(false);
      setShowDetails(false);
    } catch (error) {
      console.error('Error saving product:', error);
      // Show error message to user
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDelete = (productId: string) => {
    // Implement delete logic
    console.log('Deleting product:', productId);
    setShowDetails(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tablets':
        return 'pill';
      case 'Syrups':
        return 'bottle-tonic';
      case 'Devices':
        return 'medical-bag';
      case 'Supplements':
        return 'food-apple';
      case 'Protection':
        return 'shield-check';
      default:
        return 'pill';
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        images: [...selectedProduct.images, result.assets[0].uri]
      });
    }
  };

  const removeImage = (index: number) => {
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        images: selectedProduct.images.filter((_, i) => i !== index)
      });
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    let numValue = parseInt(value);
    
    if (type === 'day') {
      if (value === '') {
        setDate(prev => ({ ...prev, day: '' }));
      } else if (numValue >= 1 && numValue <= 31) {
        setDate(prev => ({ ...prev, day: value }));
      }
    } else if (type === 'month') {
      if (value === '') {
        setDate(prev => ({ ...prev, month: '' }));
      } else if (numValue >= 1 && numValue <= 12) {
        setDate(prev => ({ ...prev, month: value }));
      }
    } else if (type === 'year') {
      if (value === '') {
        setDate(prev => ({ ...prev, year: '' }));
      } else if (value.length <= 4) { // Allow typing up to 4 digits
        setDate(prev => ({ ...prev, year: value }));
      }
    }
  };

  const handleValidUntilDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    let numValue = parseInt(value);
    
    if (type === 'day') {
      if (value === '') {
        setValidUntilDate(prev => ({ ...prev, day: '' }));
      } else if (numValue >= 1 && numValue <= 31) {
        setValidUntilDate(prev => ({ ...prev, day: value }));
      }
    } else if (type === 'month') {
      if (value === '') {
        setValidUntilDate(prev => ({ ...prev, month: '' }));
      } else if (numValue >= 1 && numValue <= 12) {
        setValidUntilDate(prev => ({ ...prev, month: value }));
      }
    } else if (type === 'year') {
      if (value === '') {
        setValidUntilDate(prev => ({ ...prev, year: '' }));
      } else if (value.length <= 4) { // Allow typing up to 4 digits
        setValidUntilDate(prev => ({ ...prev, year: value }));
      }
    }
  };

  const handleNumberInput = (value: string, field: 'price' | 'stock' | 'percentage') => {
    if (selectedProduct) {
      const numValue = parseInt(value) || 0;
      if (numValue < 0) return; // Prevent negative values

      if (field === 'price') {
        setSelectedProduct({
          ...selectedProduct,
          price: `₹${value}`
        });
      } else if (field === 'stock') {
        setSelectedProduct({
          ...selectedProduct,
          stock: numValue
        });
      } else {
        setSelectedProduct({
          ...selectedProduct,
          discount: {
            ...selectedProduct.discount,
            percentage: numValue
          }
        });
      }
    }
  };

  const formatDateString = (input: string) => {
    // Remove non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}`;
  };

  const validateAndSetDate = (dateStr: string, field: 'manufacturingDate' | 'validUntil') => {
    const numbers = dateStr.replace(/\D/g, '');
    if (numbers.length === 8) {
      const day = parseInt(numbers.slice(0, 2));
      const month = parseInt(numbers.slice(2, 4));
      const year = parseInt(numbers.slice(4, 8));

      // Basic date validation
      if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 2024) {
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        if (selectedProduct) {
          if (field === 'manufacturingDate') {
            setSelectedProduct({
              ...selectedProduct,
              manufacturingDate: formattedDate
            });
          } else {
            setSelectedProduct({
              ...selectedProduct,
              discount: {
                ...selectedProduct.discount,
                validUntil: formattedDate
              }
            });
          }
        }
      }
    }
  };

  const formatDisplayDate = (date: string) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  // Date Input Component
  const DateInput = ({ label, date, onDateChange }: {
    label: string;
    date: { day: string; month: string; year: string };
    onDateChange: (type: 'day' | 'month' | 'year', value: string) => void;
  }) => {
    const [showDayDropdown, setShowDayDropdown] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const years = Array.from({ length: 10 }, (_, i) => (2024 + i).toString());

    const closeAllDropdowns = () => {
      setShowDayDropdown(false);
      setShowMonthDropdown(false);
      setShowYearDropdown(false);
    };

    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{label}</Text>
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: '#F8F9FA',
          borderRadius: 12,
          padding: 12,
          gap: 12,
          alignItems: 'center'
        }}>
          {/* Day Dropdown */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4, textAlign: 'center' }}>Day</Text>
            <TouchableOpacity
              onPress={() => {
                closeAllDropdowns();
                setShowDayDropdown(true);
              }}
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ fontSize: 16, textAlign: 'center', color: date.day ? '#000' : '#999' }}>
                {date.day || 'DD'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showDayDropdown && (
              <View style={{
                position: 'absolute',
                bottom: 76,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                maxHeight: 200,
                zIndex: 1000,
                elevation: 5,
                overflow: 'hidden'
              }}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 200 }}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      onPress={() => {
                        onDateChange('day', day);
                        setShowDayDropdown(false);
                      }}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0'
                      }}
                    >
                      <Text style={{ textAlign: 'center' }}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Text style={{ color: '#666', fontSize: 20 }}>/</Text>

          {/* Month Dropdown */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4, textAlign: 'center' }}>Month</Text>
            <TouchableOpacity
              onPress={() => {
                closeAllDropdowns();
                setShowMonthDropdown(true);
              }}
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ fontSize: 16, textAlign: 'center', color: date.month ? '#000' : '#999' }}>
                {date.month || 'MM'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showMonthDropdown && (
              <View style={{
                position: 'absolute',
                bottom: 76,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                maxHeight: 200,
                zIndex: 1000,
                elevation: 5,
                overflow: 'hidden'
              }}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 200 }}
                >
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      onPress={() => {
                        onDateChange('month', month);
                        setShowMonthDropdown(false);
                      }}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0'
                      }}
                    >
                      <Text style={{ textAlign: 'center' }}>{month}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Text style={{ color: '#666', fontSize: 20 }}>/</Text>

          {/* Year Dropdown */}
          <View style={{ flex: 1.5 }}>
            <Text style={{ color: '#666', fontSize: 12, marginBottom: 4, textAlign: 'center' }}>Year</Text>
            <TouchableOpacity
              onPress={() => {
                closeAllDropdowns();
                setShowYearDropdown(true);
              }}
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ fontSize: 16, textAlign: 'center', color: date.year ? '#000' : '#999' }}>
                {date.year || 'YYYY'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {showYearDropdown && (
              <View style={{
                position: 'absolute',
                bottom: 76,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                maxHeight: 200,
                zIndex: 1000,
                elevation: 5,
                overflow: 'hidden'
              }}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 200 }}
                >
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => {
                        onDateChange('year', year);
                        setShowYearDropdown(false);
                      }}
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0'
                      }}
                    >
                      <Text style={{ textAlign: 'center' }}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#6C63FF',
        padding: 16,
        paddingTop: 48,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 4
      }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 4 }}>Products</Text>
        <Text style={{ color: '#FFFFFF99', fontSize: 16, fontWeight: '500' }}>Manage your inventory</Text>
        
        {/* Search Bar */}
        <View style={{ 
          backgroundColor: '#FFFFFF20',
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: 40,
          marginTop: 12
        }}>
          <MaterialCommunityIcons name="magnify" size={20} color="white" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#FFFFFF80"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ 
              flex: 1,
              marginLeft: 12,
              fontSize: 14,
              color: 'white'
            }}
          />
        </View>
      </View>

      {/* Category Filters */}
      <View style={{ 
        backgroundColor: 'white',
        paddingVertical: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 2
      }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(category.label)}
              style={{
                backgroundColor: selectedCategory === category.label ? '#6C63FF' : 'white',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                marginBottom: 2
              }}
            >
              <MaterialCommunityIcons 
                name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
                size={14} 
                color={selectedCategory === category.label ? 'white' : '#6C63FF'} 
              />
              <Text style={{ 
                color: selectedCategory === category.label ? 'white' : '#666',
                fontSize: 12,
                fontWeight: '500'
              }}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
      >
        {filteredProducts.map((product) => (
          <View
            key={product.id}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {/* Product Image/Icon */}
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                backgroundColor: '#6C63FF20',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0
              }}>
                {product.images.length > 0 ? (
                  <Image 
                    source={{ uri: product.images[0] }}
                    style={{ width: 60, height: 60, borderRadius: 12 }}
                    onError={() => (
                      <MaterialCommunityIcons 
                        name={getCategoryIcon(product.category)} 
                        size={32} 
                        color="#6C63FF" 
                      />
                    )}
                  />
                ) : (
                  <MaterialCommunityIcons 
                    name={getCategoryIcon(product.category)} 
                    size={32} 
                    color="#6C63FF" 
                  />
                )}
              </View>

              {/* Product Info */}
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666' }} numberOfLines={2}>
                    {product.description}
                  </Text>
                </View>

                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8
                }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#6C63FF' }}>
                      {product.price}
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFC10720',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                      marginTop: 4
                    }}>
                      <Text style={{ fontSize: 12, color: '#FFC107', fontWeight: '500' }}>
                        Stock: {product.stock}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{
                      backgroundColor: product.stock > 0 ? '#4CAF5020' : '#FF525220',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 6,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: product.stock > 0 ? '#4CAF50' : '#FF5252',
                        fontWeight: '500'
                      }}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => handleEdit(product)}
                style={{
                  flex: 1,
                  backgroundColor: '#6C63FF20',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#6C63FF" />
                <Text style={{ color: '#6C63FF', fontSize: 14, fontWeight: '500' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(product.id)}
                style={{
                  flex: 1,
                  backgroundColor: '#FF525220',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                <Text style={{ color: '#FF5252', fontSize: 14, fontWeight: '500' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Product Button */}
        <TouchableOpacity
          onPress={handleAddNew}
          style={{
            backgroundColor: '#4CAF50',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            marginTop: 8
          }}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Add New Product</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Product Details/Edit Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{ 
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: '90%'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '600' }}>
                {isAdding ? 'Add Product' : isEditing ? 'Edit Product' : 'Product Details'}
              </Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Images */}
                <View style={{ 
                  backgroundColor: '#F8F9FA',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16
                }}>
                  {selectedProduct.images.length > 0 ? (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                    >
                      {selectedProduct.images.map((image, index) => (
                        <View key={index} style={{ position: 'relative' }}>
                          <View style={{
                            width: 100,
                            height: 100,
                            borderRadius: 12,
                            backgroundColor: '#6C63FF20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                          }}>
                            <Image 
                              source={{ uri: image }} 
                              style={{ width: 100, height: 100, borderRadius: 12 }}
                              onError={() => (
                                <MaterialCommunityIcons 
                                  name={getCategoryIcon(selectedProduct.category)} 
                                  size={32} 
                                  color="#6C63FF" 
                                />
                              )}
                            />
                          </View>
                          {isEditing && (
                            <TouchableOpacity
                              onPress={() => removeImage(index)}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: '#FF5252',
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <MaterialCommunityIcons name="close" size={16} color="white" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  ) : null}

                  {isEditing && (
                    <TouchableOpacity
                      onPress={pickImage}
                      style={{
                        backgroundColor: '#6C63FF20',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginTop: selectedProduct.images.length > 0 ? 16 : 0
                      }}
                    >
                      <MaterialCommunityIcons name="camera-plus" size={32} color="#6C63FF" />
                      <Text style={{ color: '#6C63FF', fontSize: 14, marginTop: 8 }}>
                        {selectedProduct.images.length > 0 ? 'Add More Images' : 'Add Product Images'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Basic Info */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Product Name</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.name}
                      onChangeText={(text) => setSelectedProduct({...selectedProduct, name: text})}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginTop: 4
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 4 }}>{selectedProduct.name}</Text>
                  )}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Description</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.description}
                      onChangeText={(text) => setSelectedProduct({...selectedProduct, description: text})}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginTop: 4,
                        height: 100
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{selectedProduct.description}</Text>
                  )}
                </View>

                {/* Price & Stock */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Price</Text>
                    {isEditing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          value={selectedProduct.price.replace('₹', '')}
                          onChangeText={(text) => handleNumberInput(text, 'price')}
                          keyboardType="numeric"
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 16,
                            marginTop: 4
                          }}
                        />
                        <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleNumberInput((parseInt(selectedProduct.price.replace('₹', '')) + 1).toString(), 'price')}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleNumberInput((parseInt(selectedProduct.price.replace('₹', '')) - 1).toString(), 'price')}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 4 }}>{selectedProduct.price}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Stock</Text>
                    {isEditing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          value={selectedProduct.stock.toString()}
                          onChangeText={(text) => handleNumberInput(text, 'stock')}
                          keyboardType="numeric"
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: '#E0E0E0',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 16,
                            marginTop: 4
                          }}
                        />
                        <View style={{ flexDirection: 'column', marginLeft: 8 }}></View>
                          <TouchableOpacity
                            onPress={() => handleNumberInput((selectedProduct.stock + 1).toString(), 'stock')}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleNumberInput((selectedProduct.stock - 1).toString(), 'stock')}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 4 }}>{selectedProduct.stock} units</Text>
                    )}
                  </View>
                </View>

                {/* Manufacturer & Manufacturing Date */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>Manufacturer</Text>
                  {isEditing ? (
                    <View style={{ 
                      backgroundColor: '#F8F9FA',
                      borderRadius: 12,
                      padding: 12
                    }}>
                      <TextInput
                        value={selectedProduct.manufacturer}
                        onChangeText={(text) => setSelectedProduct({...selectedProduct, manufacturer: text})}
                        style={{
                          backgroundColor: 'white',
                          borderWidth: 1,
                          borderColor: '#E0E0E0',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          minHeight: 48
                        }}
                        placeholder="Enter manufacturer name"
                        placeholderTextColor="#999"
                      />
                    </View>
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{selectedProduct.manufacturer}</Text>
                  )}
                </View>

                {/* Manufacturing Date */}
                {isEditing ? (
                  <DateInput 
                    label="Manufacturing Date"
                    date={date}
                    onDateChange={handleDateChange}
                  />
                ) : (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Manufacturing Date</Text>
                    <Text style={{ fontSize: 14, marginTop: 4 }}>
                      {formatDisplayDate(selectedProduct.manufacturingDate)}
                    </Text>
                  </View>
                )}

                {/* Category */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Category</Text>
                  {isEditing ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {CATEGORIES.filter(cat => cat.label !== 'All').map((category) => (
                        <TouchableOpacity
                          key={category.label}
                          onPress={() => setSelectedProduct({...selectedProduct, category: category.label})}
                          style={{
                            backgroundColor: selectedProduct.category === category.label ? '#6C63FF' : 'white',
                            borderWidth: 1,
                            borderColor: '#6C63FF',
                            borderRadius: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <MaterialCommunityIcons 
                            name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
                            size={14} 
                            color={selectedProduct.category === category.label ? 'white' : '#6C63FF'} 
                          />
                          <Text style={{ 
                            color: selectedProduct.category === category.label ? 'white' : '#6C63FF',
                            fontSize: 12,
                            fontWeight: '500'
                          }}>
                            {category.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <MaterialCommunityIcons 
                        name={
                          selectedProduct.category === 'Tablets' ? 'pill' :
                          selectedProduct.category === 'Syrups' ? 'bottle-tonic' :
                          selectedProduct.category === 'Devices' ? 'medical-bag' :
                          selectedProduct.category === 'Supplements' ? 'pill' :
                          'shield-check'
                        } 
                        size={16} 
                        color="#6C63FF" 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontSize: 14 }}>{selectedProduct.category}</Text>
                    </View>
                  )}
                </View>

                {/* Prescription Required */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Prescription Required</Text>
                  {isEditing ? (
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={() => setSelectedProduct({...selectedProduct, prescriptionRequired: true})}
                        style={{
                          flex: 1,
                          backgroundColor: selectedProduct.prescriptionRequired ? '#6C63FF' : 'white',
                          borderWidth: 1,
                          borderColor: '#6C63FF',
                          borderRadius: 8,
                          padding: 12,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ 
                          color: selectedProduct.prescriptionRequired ? 'white' : '#6C63FF',
                          fontSize: 14,
                          fontWeight: '500'
                        }}>
                          Yes
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setSelectedProduct({...selectedProduct, prescriptionRequired: false})}
                        style={{
                          flex: 1,
                          backgroundColor: !selectedProduct.prescriptionRequired ? '#6C63FF' : 'white',
                          borderWidth: 1,
                          borderColor: '#6C63FF',
                          borderRadius: 8,
                          padding: 12,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ 
                          color: !selectedProduct.prescriptionRequired ? 'white' : '#6C63FF',
                          fontSize: 14,
                          fontWeight: '500'
                        }}>
                          No
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>
                      {selectedProduct.prescriptionRequired ? 'Yes' : 'No'}
                    </Text>
                  )}
                </View>

                {/* Ingredients */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Ingredients</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.ingredients.join(', ')}
                      onChangeText={(text) => setSelectedProduct({...selectedProduct, ingredients: text.split(',')})}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginTop: 4,
                        height: 100
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>
                      {selectedProduct.ingredients.join(', ')}
                    </Text>
                  )}
                </View>

                {/* Dosage */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Dosage</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.dosage}
                      onChangeText={(text) => setSelectedProduct({...selectedProduct, dosage: text})}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginTop: 4
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{selectedProduct.dosage}</Text>
                  )}
                </View>

                {/* Side Effects */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Side Effects</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.sideEffects}
                      onChangeText={(text) => setSelectedProduct({...selectedProduct, sideEffects: text})}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginTop: 4,
                        height: 100
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{selectedProduct.sideEffects || 'No side effects reported'}</Text>
                  )}
                </View>

                {/* Storage Instructions */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Storage Instructions</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.storageInstructions}
                      onChangeText={(text) => setSelectedProduct({...selectedProduct, storageInstructions: text})}
                      multiline
                      style={{
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        marginTop: 4,
                        height: 100
                      }}
                    />
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{selectedProduct.storageInstructions || 'Store in a cool, dry place'}</Text>
                  )}
                </View>

                {/* Discount */}
                {isEditing && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Discount</Text>
                    <View style={{ flexDirection: 'column', gap: 16, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Percentage</Text>
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          backgroundColor: '#F8F9FA',
                          borderRadius: 12,
                          padding: 12
                        }}>
                          <TextInput
                            value={selectedProduct.discount?.percentage?.toString() || ''}
                            onChangeText={(text) => handleNumberInput(text, 'percentage')}
                            keyboardType="numeric"
                            style={{
                              flex: 1,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              borderColor: '#E0E0E0',
                              borderRadius: 8,
                              padding: 12,
                              fontSize: 16,
                              textAlign: 'center'
                            }}
                            placeholder="Enter discount %"
                            placeholderTextColor="#999"
                          />
                          <View style={{ flexDirection: 'column', marginLeft: 12 }}>
                            <TouchableOpacity
                              onPress={() => handleNumberInput(((selectedProduct.discount?.percentage || 0) + 1).toString(), 'percentage')}
                              style={{ 
                                backgroundColor: 'white',
                                padding: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#E0E0E0'
                              }}
                            >
                              <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleNumberInput(((selectedProduct.discount?.percentage || 0) - 1).toString(), 'percentage')}
                              style={{ 
                                backgroundColor: 'white',
                                padding: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#E0E0E0',
                                marginTop: 8
                              }}
                            >
                              <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      
                      <DateInput 
                        label="Valid Until"
                        date={validUntilDate}
                        onDateChange={handleValidUntilDateChange}
                      />
                    </View>
                  </View>
                )}

                {isEditing && (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      onPress={handleSave}
                      style={{
                        flex: 1,
                        backgroundColor: '#4CAF50',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <MaterialCommunityIcons name="check" size={20} color="white" />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                        {isAdding ? 'Add Product' : 'Save Changes'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing(false);
                        setShowDetails(false);
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#FF5252',
                        padding: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="white" />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
} 