import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
}

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
  }>;
  status: 'pending' | 'processing' | 'dispatched' | 'delivered';
  totalAmount: number;
  orderDate: string;
}

const PharmacyDashboard = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  });

  const handleAddProduct = () => {
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      description: newProduct.description,
    };
    setProducts([...products, product]);
    setIsAddProductModalVisible(false);
    setNewProduct({ name: '', price: '', stock: '', description: '' });
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text>Price: ${item.price}</Text>
      <Text>Stock: {item.stock}</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {/* TODO: Implement edit product */}}
      >
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <Text style={styles.orderTitle}>Order #{item.id}</Text>
      <Text>Customer: {item.customerName}</Text>
      <Text>Total: ${item.totalAmount}</Text>
      <Text>Status: {item.status}</Text>
      <View style={styles.orderActions}>
        {item.status !== 'delivered' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateOrderStatus(item.id, 
              item.status === 'pending' ? 'processing' :
              item.status === 'processing' ? 'dispatched' : 'delivered'
            )}
          >
            <Text style={styles.buttonText}>
              {item.status === 'pending' ? 'Process' :
               item.status === 'processing' ? 'Dispatch' : 'Mark Delivered'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Text>Orders</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'inventory' ? (
        <>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddProductModalVisible(true)}
          >
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
          />
        </>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
        />
      )}

      <Modal
        visible={isAddProductModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              value={newProduct.stock}
              onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newProduct.description}
              onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddProductModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddProduct}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
});

export default PharmacyDashboard;
