import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Image, Platform, Alert, StyleSheet, ActivityIndicator, ToastAndroid } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchBar } from 'react-native-elements';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { BACKEND_API_URL } from '../../../config/config';

interface Product {
  id: string;
  _id?: string;  // Add _id as optional
  name: string;
  description: string;
  price: number;
  manufacturer: string;
  category: string;
  customerCategory?: string; // Add this field
  stock: number;
  manufacturingDate: string;
  prescriptionRequired: boolean;
  ingredients?: string[];
  dosage?: string;
  sideEffects?: string;
  storageInstructions?: string;
  images: string[];
  newImages?: { uri: string }[];
  discount: {
    percentage: number;
    validUntil: string;
  };
  rating: number;
  reviews: number;
}

interface ProductData {
  name: string;
  description: string;
  price: string;
  manufacturer: string;
  category: string;
  stock: string;
  manufacturingDate: string;
  prescriptionRequired: string;
  ingredients?: string;
  dosage?: string;
  sideEffects?: string;
  storageInstructions?: string;
  images?: string[];
  discount: {
    percentage: number;
    validUntil?: string;
  };
  _id?: string;
}

interface PendingImageDeletion {
  url: string;
  timestamp: number;
}

const PRODUCTS: Product[] = [
  {
    id: 'PRD001',
    name: 'Paracetamol 500mg',
    description: 'Pain relief tablets for headache and fever',
    price: 49.99,
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
    price: 299.99,
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
    price: 1499.99,
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
    price: 399.99,
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
    price: 89.99,
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
  { label: 'All', icon: 'view-grid' },  // Changed icon for All category
  { label: 'Tablets', icon: 'pill' },
  { label: 'Syrups', icon: 'bottle-tonic' },
  { label: 'Devices', icon: 'medical-bag' },
  { label: 'Supplements', icon: 'pill' },
  { label: 'Protection', icon: 'shield-check' }
];

// Mapping pharmacy categories to customer categories
const CATEGORY_MAPPING = {
  'Tablets': ['Healthcare', 'Ayurveda'],  // Can be either regular medicine or Ayurvedic tablets
  'Syrups': ['Healthcare', 'Nutritional Drinks', 'Ayurveda'],  // Can be regular medicine, health drinks, or Ayurvedic syrups
  'Devices': ['Healthcare', 'Personal Care'],  // Medical devices and personal care devices
  'Supplements': ['Vitamins', 'Nutritional Drinks', 'Ayurveda'],  // Vitamins, protein supplements, and Ayurvedic supplements
  'Protection': ['Personal Care', 'Healthcare', 'Baby Care']  // Personal care items, medical protection, and baby items
};

// List of common Ayurvedic terms and brands
const AYURVEDIC_KEYWORDS = [
  'ayurved',
  'ayurveda',
  'patanjali',
  'dabur',
  'himalaya',
  'kerala',
  'chyawanprash',
  'ashwagandha',
  'giloy',
  'tulsi',
  'amla',
  'churna',
  'baidyanath',
  'zandu',
  'herbal',
  'traditional',
  'natural remedy',
  'jadi booti',
  'rasayan',
  'kashayam',
  'arishtam',
  'asavam',
  'guggul',
  'kalpa',
  'vati',
  'bhasma',
  'tailam'
];

// Helper function to check if a product is Ayurvedic
const isAyurvedicProduct = (product: Product): boolean => {
  const textToCheck = `${product.name} ${product.description} ${product.manufacturer}`.toLowerCase();
  return AYURVEDIC_KEYWORDS.some(keyword => textToCheck.includes(keyword));
};

// Helper function to determine customer category based on product type
const determineCustomerCategory = (product: Product): string => {
  const categories = CATEGORY_MAPPING[product.category as keyof typeof CATEGORY_MAPPING] || [];
  
  // Default to Healthcare if no mapping found
  if (categories.length === 0) return 'Healthcare';
  
  // First check if it's an Ayurvedic product
  if (isAyurvedicProduct(product)) {
    return 'Ayurveda';
  }
  
  // Then check other categories
  if (product.category === 'Syrups') {
    // If it's a nutritional drink (like Horlicks, Boost etc)
    if (product.name.toLowerCase().includes('drink') || 
        product.description.toLowerCase().includes('drink') ||
        product.name.toLowerCase().includes('protein') ||
        product.description.toLowerCase().includes('protein')) {
      return 'Nutritional Drinks';
    }
    return 'Healthcare';  // Default medical syrups to Healthcare
  }
  
  if (product.category === 'Protection') {
    // If it's baby related
    if (product.name.toLowerCase().includes('baby') || 
        product.description.toLowerCase().includes('baby') ||
        product.name.toLowerCase().includes('infant') ||
        product.description.toLowerCase().includes('infant')) {
      return 'Baby Care';
    }
    // If it's personal care
    if (product.name.toLowerCase().includes('mask') ||
        product.description.toLowerCase().includes('mask') ||
        product.name.toLowerCase().includes('sanitizer') ||
        product.description.toLowerCase().includes('sanitizer')) {
      return 'Personal Care';
    }
    return 'Healthcare';  // Default medical protection to Healthcare
  }
  
  if (product.category === 'Supplements') {
    // If it's a vitamin supplement
    if (product.name.toLowerCase().includes('vitamin') || 
        product.description.toLowerCase().includes('vitamin')) {
      return 'Vitamins';
    }
    return 'Nutritional Drinks';  // Default supplements to Nutritional
  }
  
  return categories[0];  // Return first mapped category as default
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<PendingImageDeletion[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Add fetchProducts function
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_API_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched products:', data);
      
      // Transform the data to match our Product interface
      const transformedProducts = data.map((item: any) => {
        // Clean up ingredients - ensure it's a simple array of strings
        let cleanIngredients: string[] = [];
        if (item.ingredients && Array.isArray(item.ingredients)) {
          cleanIngredients = item.ingredients
            .map((ingredient: any) => {
              if (typeof ingredient === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  const parsed = JSON.parse(ingredient);
                  if (Array.isArray(parsed)) {
                    return parsed[0];
                  }
                  return ingredient;
                } catch (e) {
                  return ingredient;
                }
              }
              return ingredient;
            })
            .filter((ingredient: any) => ingredient && ingredient.trim() !== '');
        }
        
        return {
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          stock: item.stock,
          category: item.category,
          manufacturer: item.manufacturer,
          manufacturingDate: item.manufacturingDate || '',
          prescriptionRequired: item.prescriptionRequired || false,
          ingredients: cleanIngredients,
          dosage: item.dosage || '',
          sideEffects: item.sideEffects || '',
          storageInstructions: item.storageInstructions || '',
          images: item.images || [],
          discount: {
            percentage: item.discount?.percentage || 0,
            validUntil: item.discount?.validUntil || ''
          },
          rating: item.rating || 0,
          reviews: item.reviews || 0
        };
      });
      
      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please check your connection.');
      setProducts(PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on selected category and search query
    let filtered = [...products];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const name = product.name?.toLowerCase() ?? '';
        const description = product.description?.toLowerCase() ?? '';
        const ingredientMatch = product.ingredients?.some(
          ingredient => (ingredient?.toLowerCase() ?? '').includes(query)
        ) ?? false;
        
        return name.includes(query) || 
               description.includes(query) || 
               ingredientMatch;
      });
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const handleSearch = (text?: string) => {
    setSearchQuery(text || '');
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleEdit = async (product: Product) => {
    if (product) {
      try {
        // Fetch the latest product data from the server
        const response = await fetch(`${BACKEND_API_URL}/api/products/${product.id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedProductData = await response.json();
        console.log('Fetched product details:', updatedProductData);
        
        // Transform the data to match our Product interface
        const updatedProduct: Product = {
          id: updatedProductData._id,
          name: updatedProductData.name,
          description: updatedProductData.description,
          price: updatedProductData.price,
          stock: updatedProductData.stock,
          category: updatedProductData.category,
          manufacturer: updatedProductData.manufacturer,
          manufacturingDate: updatedProductData.manufacturingDate || '',
          prescriptionRequired: updatedProductData.prescriptionRequired || false,
          ingredients: updatedProductData.ingredients || [],
          dosage: updatedProductData.dosage || '',
          sideEffects: updatedProductData.sideEffects || '',
          storageInstructions: updatedProductData.storageInstructions || '',
          images: updatedProductData.images || [],
          newImages: [], // Initialize newImages as empty array
          discount: {
            percentage: updatedProductData.discount?.percentage || 0,
            validUntil: updatedProductData.discount?.validUntil || ''
          },
          rating: updatedProductData.rating || 0,
          reviews: updatedProductData.reviews || 0
        };
        
        console.log('Updated product with images:', updatedProduct.images);
        
        setSelectedProduct(updatedProduct);
        
        // Parse manufacturing date from dd-mm-yyyy format
        if (updatedProduct.manufacturingDate) {
          const [day, month, year] = updatedProduct.manufacturingDate.split('-');
          setDate({ 
            day: day || '', 
            month: month || '', 
            year: year || '' 
          });
        } else {
          setDate({ day: '', month: '', year: '' });
        }
        
        // Parse valid until date from dd-mm-yyyy format
        if (updatedProduct.discount?.validUntil) {
          const [day, month, year] = updatedProduct.discount.validUntil.split('-');
          setValidUntilDate({ 
            day: day || '', 
            month: month || '', 
            year: year || '' 
          });
        } else {
          setValidUntilDate({ day: '', month: '', year: '' });
        }
        
        setIsEditing(true);
        setIsAdding(false);
        setShowDetails(true);
      } catch (error) {
        console.error('Error fetching product details:', error);
        Alert.alert('Error', 'Failed to fetch product details. Please try again.');
        
        // Fallback to using the product data we already have
        setSelectedProduct({...product, newImages: []});
        
        // Parse manufacturing date from dd-mm-yyyy format
        if (product.manufacturingDate) {
          const [day, month, year] = product.manufacturingDate.split('-');
          setDate({ 
            day: day || '', 
            month: month || '', 
            year: year || '' 
          });
        } else {
          setDate({ day: '', month: '', year: '' });
        }
        
        // Parse valid until date from dd-mm-yyyy format
        if (product.discount?.validUntil) {
          const [day, month, year] = product.discount.validUntil.split('-');
          setValidUntilDate({ 
            day: day || '', 
            month: month || '', 
            year: year || '' 
          });
        } else {
          setValidUntilDate({ day: '', month: '', year: '' });
        }
        
        setIsEditing(true);
        setIsAdding(false);
        setShowDetails(true);
      }
    }
  };

  const handleAddNew = () => {
    const newProduct: Product = {
      id: '',
      name: '',
      description: '',
      price: 0,
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
    };
    setSelectedProduct(newProduct);
    setDate({ day: '', month: '', year: '' });
    setValidUntilDate({ day: '', month: '', year: '' });
    setIsAdding(true);
    setIsEditing(true);
    setShowDetails(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      // Validate required fields
      if (!selectedProduct.name) {
        Alert.alert('Error', 'Product name is required');
        return;
      }
      if (!selectedProduct.description) {
        Alert.alert('Error', 'Description is required');
        return;
      }

      // Validate manufacturing date
      if (!date.day || !date.month || !date.year) {
        Alert.alert('Error', 'Manufacturing date is required');
        return;
      }
      
      // Validate valid until date
      if (!validUntilDate.day || !validUntilDate.month || !validUntilDate.year) {
        Alert.alert('Error', 'Valid until date is required');
        return;
      }

      // Format dates
      const formattedManufacturingDate = `${date.day}-${date.month}-${date.year}`;
      const formattedValidUntilDate = `${validUntilDate.day}-${validUntilDate.month}-${validUntilDate.year}`;

      // Determine customer category based on product details
      const customerCategory = determineCustomerCategory(selectedProduct);

      // Prepare product data
      const productData = {
          ...selectedProduct,
        manufacturingDate: formattedManufacturingDate,
          discount: {
          ...selectedProduct.discount,
          validUntil: formattedValidUntilDate
        },
        customerCategory: customerCategory // Add the determined customer category
      };

      // Create FormData for the request
      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));

      // Add new images if any
      if (selectedProduct.newImages && selectedProduct.newImages.length > 0) {
        selectedProduct.newImages.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`
          } as any);
        });
      }

      // Add existing images
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        formData.append('existingImages', JSON.stringify(selectedProduct.images));
      }

      // Make API request
      const response = await fetch(`${BACKEND_API_URL}/products${selectedProduct._id ? `/${selectedProduct._id}` : ''}`, {
        method: selectedProduct._id ? 'PUT' : 'POST',
        body: formData,
          headers: {
          'Content-Type': 'multipart/form-data',
          },
        });

        if (!response.ok) {
        throw new Error('Failed to save product');
      }

      const result = await response.json();
      console.log('Product saved successfully:', result);

      // Refresh products list
      fetchProducts();

      // Close modal and reset state
      setShowDetails(false);
      setSelectedProduct(null);
      setIsAdding(false);
      setIsEditing(false);
      setDate({ day: '', month: '', year: '' });
      setValidUntilDate({ day: '', month: '', year: '' });

      Alert.alert('Success', 'Product saved successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Delete Product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsDeleting(productId);
                const response = await fetch(`${BACKEND_API_URL}/products/${productId}`, {
                  method: 'DELETE',
                });

                if (!response.ok) {
                  throw new Error('Failed to delete product');
                }

                // Remove the product from the local state
                setProducts(products.filter(product => product.id !== productId));
                setFilteredProducts(filteredProducts.filter(product => product.id !== productId));
                
                Alert.alert('Success', 'Product deleted successfully');
              } catch (error) {
                console.error('Error deleting product:', error);
                Alert.alert('Error', 'Failed to delete product. Please try again.');
              } finally {
                setIsDeleting(null);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error showing confirmation dialog:', error);
    }
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
    try {
      console.log('[IMAGE] Opening image picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
        aspect: [4, 3],
      quality: 1,
    });

      if (!result.canceled) {
        const newImage = result.assets[0];
        console.log(`[IMAGE] Image selected: ${newImage.uri}`);
        setSelectedProduct(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            newImages: [...(prev.newImages || []), newImage]
          };
        });
        console.log(`[IMAGE] Added image to newImages array. Total new images: ${(selectedProduct?.newImages?.length || 0) + 1}`);
      } else {
        console.log('[IMAGE] Image selection cancelled by user');
      }
    } catch (error) {
      console.error('[IMAGE] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeLocalImage = (index: number) => {
    if (selectedProduct) {
      setSelectedProduct({
        ...selectedProduct,
        images: selectedProduct.images.filter((_, i) => i !== index)
      });
    }
  };

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      if (!selectedProduct) return;

      // If it's a new image (not yet uploaded), just remove it from the newImages array
      if (selectedProduct.newImages && index < selectedProduct.newImages.length) {
        console.log(`[IMAGE] Deleting new image at index ${index} (not yet uploaded to Backblaze)`);
        setSelectedProduct(prev => {
          if (!prev) return prev;
          const newImages = [...(prev.newImages || [])];
          newImages.splice(index, 1);
          return {
            ...prev,
            newImages
          };
        });
        return;
      }

      // For existing images (already uploaded to Backblaze), show confirmation
      const imageIndex = index - (selectedProduct.newImages?.length || 0);
      if (imageIndex >= 0 && selectedProduct.images) {
        console.log(`[IMAGE] Attempting to delete existing image at index ${imageIndex} (URL: ${imageUrl})`);
        // Show confirmation dialog for deleting uploaded images
        Alert.alert(
          'Delete Image',
          'Are you sure you want to delete this image? This action cannot be undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                console.log(`[IMAGE] Deletion cancelled for image at index ${imageIndex}`);
              }
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                console.log(`[IMAGE] User confirmed deletion of image at index ${imageIndex}`);
                const updatedImages = [...selectedProduct.images];
                updatedImages.splice(imageIndex, 1);
                
                setSelectedProduct(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    images: updatedImages
                  };
                });

                // Add to pending deletions
                setPendingDeletions(prev => {
                  console.log(`[IMAGE] Added image to pending deletions: ${imageUrl}`);
                  return [
                    ...prev,
                    { url: imageUrl, timestamp: Date.now() }
                  ];
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('[IMAGE] Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image. Please try again.');
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
        setDate(prev => ({ ...prev, day: value.padStart(2, '0') }));
      }
    } else if (type === 'month') {
      if (value === '') {
        setDate(prev => ({ ...prev, month: '' }));
      } else if (numValue >= 1 && numValue <= 12) {
        setDate(prev => ({ ...prev, month: value.padStart(2, '0') }));
      }
    } else if (type === 'year') {
      if (value === '') {
        setDate(prev => ({ ...prev, year: '' }));
      } else if (value.length <= 4) {
        setDate(prev => ({ ...prev, year: value }));
      }
    }

    // Update manufacturing date in selectedProduct whenever date changes
    if (selectedProduct) {
      const updatedDate = {
        day: type === 'day' ? value.padStart(2, '0') : date.day,
        month: type === 'month' ? value.padStart(2, '0') : date.month,
        year: type === 'year' ? value : date.year
      };

      if (updatedDate.day && updatedDate.month && updatedDate.year) {
        const formattedDate = `${updatedDate.day}-${updatedDate.month}-${updatedDate.year}`;
        setSelectedProduct({
          ...selectedProduct,
          manufacturingDate: formattedDate
        });
      }
    }
  };

  const handleValidUntilDateChange = (type: 'day' | 'month' | 'year', value: string) => {
    let numValue = parseInt(value);
    
    if (type === 'day') {
      if (value === '') {
        setValidUntilDate(prev => ({ ...prev, day: '' }));
      } else if (numValue >= 1 && numValue <= 31) {
        setValidUntilDate(prev => ({ ...prev, day: value.padStart(2, '0') }));
      }
    } else if (type === 'month') {
      if (value === '') {
        setValidUntilDate(prev => ({ ...prev, month: '' }));
      } else if (numValue >= 1 && numValue <= 12) {
        setValidUntilDate(prev => ({ ...prev, month: value.padStart(2, '0') }));
      }
    } else if (type === 'year') {
      if (value === '') {
        setValidUntilDate(prev => ({ ...prev, year: '' }));
      } else if (value.length <= 4) {
        setValidUntilDate(prev => ({ ...prev, year: value }));
      }
    }

    // Update valid until date in selectedProduct whenever date changes
    if (selectedProduct) {
      const updatedDate = {
        day: type === 'day' ? value.padStart(2, '0') : validUntilDate.day,
        month: type === 'month' ? value.padStart(2, '0') : validUntilDate.month,
        year: type === 'year' ? value : validUntilDate.year
      };

      if (updatedDate.day && updatedDate.month && updatedDate.year) {
        const formattedDate = `${updatedDate.day}-${updatedDate.month}-${updatedDate.year}`;
        setSelectedProduct({
          ...selectedProduct,
          discount: {
            ...selectedProduct.discount,
            validUntil: formattedDate
          }
        });
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
          price: numValue
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
            percentage: numValue,
            validUntil: selectedProduct.discount?.validUntil || new Date().toISOString()
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
                percentage: selectedProduct.discount?.percentage || 0,
                validUntil: formattedDate
              }
            });
          }
        }
      }
    }
  };

  const formatDisplayDate = (date: string | undefined) => {
    if (!date) return '';
    return date; // Already in dd-mm-yyyy format from backend
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
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());

    const closeAllDropdowns = () => {
      setShowDayDropdown(false);
      setShowMonthDropdown(false);
      setShowYearDropdown(false);
    };

    // Ensure the year is displayed as a 4-digit number
    const displayYear = date.year ? 
      date.year.length === 4 ? date.year : new Date().getFullYear().toString() 
      : 'YYYY';

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
                {displayYear}
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

  // Update image caching
  const [imageCache, setImageCache] = useState<{[key: string]: string}>({});

  const cacheImage = async (imageUrl: string) => {
    if (imageCache[imageUrl]) return imageCache[imageUrl];
    
    try {
      // For local files (file://), use directly
      if (imageUrl.startsWith('file://')) {
        setImageCache(prev => ({...prev, [imageUrl]: imageUrl}));
        return imageUrl;
      }
      
      // For remote URLs, download and cache
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a local URI for the blob
      const localUri = Platform.OS === 'android' 
        ? `data:image/jpeg;base64,${await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
            reader.readAsDataURL(blob);
          })}`
        : URL.createObjectURL(blob);
      
      setImageCache(prev => ({...prev, [imageUrl]: localUri}));
      return localUri;
    } catch (error) {
      console.error('Error caching image:', error);
      return imageUrl; // Return original URL if caching fails
    }
  };

  // Update ProductImage component
  const ProductImage = ({ imageUrl, category }: { imageUrl: string; category: string }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // For local files, display directly
    if (imageUrl.startsWith('file://')) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: 8 
          }}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      );
    }

    // For B2 URLs, use as is since they are already authorized
    const iconSize = 24;

    if (hasError) {
      return (
        <View style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 8,
          backgroundColor: '#F8F9FA',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <MaterialCommunityIcons 
            name={getCategoryIcon(category)} 
            size={iconSize}
            color="#6C63FF" 
          />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 8 
        }}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(error) => {
          console.error('Error loading image:', imageUrl, error);
          setHasError(true);
        }}
      />
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
          marginHorizontal: 16,
          marginTop: 16,
          backgroundColor: '#FFFFFF20',
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12
        }}>
          <MaterialCommunityIcons name="magnify" size={24} color="white" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#FFFFFF80"
            value={searchQuery}
            onChangeText={handleSearch}
            style={{ 
              flex: 1,
              color: 'white',
              paddingVertical: 8,
              paddingHorizontal: 8,
              fontSize: 16
            }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={handleSearchClear}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          ) : null}
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
      <View style={{ flex: 1 }}>
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
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                backgroundColor: '#6C63FF20',
                justifyContent: 'center',
                alignItems: 'center',
                  flexShrink: 0,
                  overflow: 'hidden'
              }}>
                      <MaterialCommunityIcons 
                        name={getCategoryIcon(product.category)} 
                  size={24}
                        color="#6C63FF" 
                      />
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
                        ₹{product.price}
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
                  style={[styles.deleteButton, isDeleting === product.id && styles.disabledButton]}
                  disabled={isDeleting === product.id}
                >
                  {isDeleting === product.id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <MaterialCommunityIcons name="delete" size={24} color="#fff" />
                  )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
        </ScrollView>

        {/* Fixed Add Product Button */}
        <View style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}>
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
          }}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Add New Product</Text>
        </TouchableOpacity>
        </View>
      </View>

      {/* Product Details/Edit Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          // Restore images if there are pending deletions and user is closing
          if (pendingDeletions.length > 0 && selectedProduct) {
            const restoredImages = [...selectedProduct.images];
            pendingDeletions.forEach(deletion => {
              restoredImages.push(deletion.url);
            });
            setSelectedProduct({
              ...selectedProduct,
              images: restoredImages
            });
          }
          setPendingDeletions([]);
          setShowDetails(false);
        }}
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
            height: '90%'
          }}>
            {/* Header with Title and Action Buttons */}
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F0F0F0'
              }}>
              <Text style={{ fontSize: 20, fontWeight: '600' }}>
                {isAdding ? 'Add Product' : isEditing ? 'Edit Product' : 'Product Details'}
              </Text>
                <TouchableOpacity 
                  onPress={() => {
                    // Restore images if there are pending deletions
                    if (pendingDeletions.length > 0 && selectedProduct) {
                      const restoredImages = [...selectedProduct.images];
                      pendingDeletions.forEach(deletion => {
                        restoredImages.push(deletion.url);
                      });
                      setSelectedProduct({
                        ...selectedProduct,
                        images: restoredImages
                      });
                    }
                    setPendingDeletions([]);
                    setShowDetails(false);
                  }}
                >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

              {isEditing && (
                <View style={{ 
                  flexDirection: 'row', 
                  padding: 16, 
                  gap: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F0F0'
                }}>
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
                      // Restore images if there are pending deletions
                      if (pendingDeletions.length > 0 && selectedProduct) {
                        const restoredImages = [...selectedProduct.images];
                        pendingDeletions.forEach(deletion => {
                          restoredImages.push(deletion.url);
                        });
                        setSelectedProduct({
                          ...selectedProduct,
                          images: restoredImages
                        });
                      }
                      setPendingDeletions([]);
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
            </View>

            {/* Form Content */}
            {selectedProduct && (
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Product Images */}
                <View style={{ 
                  backgroundColor: '#F8F9FA',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16
                }}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12 }}
                    >
                    {/* Show existing images */}
                    {selectedProduct.images && selectedProduct.images.length > 0 && selectedProduct.images.map((image, index) => (
                      <View key={`existing-${index}`} style={{ position: 'relative' }}>
                          <View style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                          backgroundColor: '#6C63FF20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden'
                        }}>
                          <ProductImage imageUrl={image} category={selectedProduct.category} />
                        </View>
                        {isEditing && (
                          <TouchableOpacity
                            onPress={() => handleDeleteImage(image, index)}
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              backgroundColor: '#FF5252',
                              width: 24,
                              height: 24,
                            borderRadius: 12,
                              justifyContent: 'center',
                              alignItems: 'center',
                              elevation: 2,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 4,
                            }}
                          >
                            <MaterialCommunityIcons name="close" size={16} color="white" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {/* Show new images */}
                    {selectedProduct.newImages && selectedProduct.newImages.length > 0 && selectedProduct.newImages.map((image, index) => (
                      <View key={`new-${index}`} style={{ position: 'relative' }}>
                        <View style={{
                          width: 80,
                          height: 80,
                          borderRadius: 8,
                            backgroundColor: '#6C63FF20',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                          }}>
                            <Image 
                            source={{ uri: image.uri }} 
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                            />
                          </View>
                          {isEditing && (
                            <TouchableOpacity
                            onPress={() => handleDeleteImage(image.uri, index)}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                backgroundColor: '#FF5252',
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                justifyContent: 'center',
                              alignItems: 'center',
                              elevation: 2,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 4,
                              }}
                            >
                              <MaterialCommunityIcons name="close" size={16} color="white" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </ScrollView>

                  {isEditing && (
                    <TouchableOpacity
                      onPress={pickImage}
                      style={{
                        backgroundColor: '#6C63FF20',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginTop: ((selectedProduct.images && selectedProduct.images.length > 0) || (selectedProduct.newImages && selectedProduct.newImages.length > 0)) ? 16 : 0
                      }}
                    >
                      <MaterialCommunityIcons name="camera-plus" size={24} color="#6C63FF" />
                      <Text style={{ color: '#6C63FF', fontSize: 14, marginTop: 8 }}>
                        {((selectedProduct.images && selectedProduct.images.length > 0) || (selectedProduct.newImages && selectedProduct.newImages.length > 0)) ? 'Add More Images' : 'Add Product Images'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Basic Info */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>
                    Product Name <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.name}
                      onChangeText={(text) => {
                        setSelectedProduct({...selectedProduct, name: text});
                      }}
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

                {/* Description */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>
                    Description <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.description}
                      onChangeText={(text) => {
                        setSelectedProduct({...selectedProduct, description: text});
                      }}
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
                      placeholder="Enter product description"
                      placeholderTextColor="#999"
                    />
                  ) : (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>{selectedProduct.description}</Text>
                  )}
                </View>

                {/* Price & Stock */}
                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>
                      Price <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    {isEditing ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          value={selectedProduct.price.toString()}
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
                            onPress={() => {
                              handleNumberInput((parseInt(selectedProduct.price.toString() || '0') + 1).toString(), 'price');
                            }}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              handleNumberInput((parseInt(selectedProduct.price.toString() || '0') - 1).toString(), 'price');
                            }}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 4 }}>₹{selectedProduct.price}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>
                      Stock <Text style={{ color: 'red' }}>*</Text>
                    </Text>
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
                        <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                          <TouchableOpacity
                            onPress={() => {
                              handleNumberInput((selectedProduct.stock + 1).toString(), 'stock');
                            }}
                            style={{ padding: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              handleNumberInput((selectedProduct.stock - 1).toString(), 'stock');
                            }}
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
                  <Text style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                    Manufacturer <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  {isEditing ? (
                    <View style={{ 
                      backgroundColor: '#F8F9FA',
                      borderRadius: 12,
                      padding: 12
                    }}>
                      <TextInput
                        value={selectedProduct.manufacturer}
                        onChangeText={(text) => {
                          setSelectedProduct({...selectedProduct, manufacturer: text});
                        }}
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
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>
                      Manufacturing Date <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                  <DateInput 
                      label=""
                    date={date}
                    onDateChange={handleDateChange}
                  />
                  </View>
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
                  <Text style={{ color: '#666', fontSize: 14 }}>
                    Category <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  {isEditing ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {CATEGORIES.filter(cat => cat.label !== 'All').map((category) => (
                        <TouchableOpacity
                          key={category.label}
                          onPress={() => {
                            setSelectedProduct({...selectedProduct, category: category.label});
                          }}
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
                        name={getCategoryIcon(selectedProduct.category)} 
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
                        onPress={() => {
                          setSelectedProduct({...selectedProduct, prescriptionRequired: true});
                        }}
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
                        onPress={() => {
                          setSelectedProduct({...selectedProduct, prescriptionRequired: false});
                        }}
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
                      value={selectedProduct.ingredients ? selectedProduct.ingredients.join(', ') : ''}
                      onChangeText={(text) => {
                        setSelectedProduct({...selectedProduct, ingredients: text ? text.split(',').map(i => i.trim()) : []});
                      }}
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
                      {selectedProduct.ingredients?.join(', ')}
                    </Text>
                  )}
                </View>

                {/* Dosage */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Dosage</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.dosage}
                      onChangeText={(text) => {
                        setSelectedProduct({...selectedProduct, dosage: text});
                      }}
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
                      onChangeText={(text) => {
                        setSelectedProduct({...selectedProduct, sideEffects: text});
                      }}
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
                      {selectedProduct.sideEffects || 'No side effects reported'}
                    </Text>
                  )}
                </View>

                {/* Storage Instructions */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ color: '#666', fontSize: 14 }}>Storage Instructions</Text>
                  {isEditing ? (
                    <TextInput
                      value={selectedProduct.storageInstructions}
                      onChangeText={(text) => {
                        setSelectedProduct({...selectedProduct, storageInstructions: text});
                      }}
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
                      {selectedProduct.storageInstructions || 'Store in a cool, dry place'}
                    </Text>
                  )}
                </View>

                {/* Discount section */}
                {isEditing && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>
                      Discount <Text style={{ color: 'red' }}>*</Text>
                    </Text>
                    <View style={{ flexDirection: 'column', gap: 16, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                          Percentage <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          backgroundColor: '#F8F9FA',
                          borderRadius: 12,
                          padding: 12
                        }}>
                          <TextInput
                            value={selectedProduct.discount?.percentage?.toString()}
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
                              onPress={() => {
                                handleNumberInput(((selectedProduct.discount?.percentage || 0) + 1).toString(), 'percentage');
                              }}
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
                              onPress={() => {
                                handleNumberInput(((selectedProduct.discount?.percentage || 0) - 1).toString(), 'percentage');
                              }}
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
                      
                      <View>
                        <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                          Valid Until <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                      <DateInput 
                          label=""
                        date={validUntilDate}
                        onDateChange={handleValidUntilDateChange}
                      />
                    </View>
                  </View>
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

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#FF5252',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});