'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { getFirestore, collection, deleteDoc, getDocs, query, setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  CircularProgress, 
  Card, 
  CardContent, 
  CardActions, 
  CardHeader, 
  Avatar 
} from "@mui/material";

const firebaseConfig = {
  apiKey: "AIzaSyBIzIQ10INodosDeviXl6JMjO-dt3VXvPk",
  authDomain: "inventory-management-64c81.firebaseapp.com",
  projectId: "inventory-management-64c81",
  storageBucket: "inventory-management-64c81.appspot.com",
  messagingSenderId: "431844458403",
  appId: "1:431844458403:web:fb60d40c7691109e3d2416"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    setLoading(true)
    const snapshot = await getDocs(query(collection(firestore, 'inventory')))
    const inventoryList = [];
    snapshot.docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
    setLoading(false)
  }

  const addItem = async (item) => {
    setLoading(true)
    const docRef = doc(firestore, 'inventory', item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await updateDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    setLoading(true)
    const docRef = doc(firestore, 'inventory', item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await updateDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const incrementItem = async (item) => {
    setLoading(true)
    const docRef = doc(firestore, 'inventory', item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await updateDoc(docRef, { quantity: quantity + 1 })
    }
    await updateInventory()
  }

  const decrementItem = async (item) => {
    setLoading(true)
    const docRef = doc(firestore, 'inventory', item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity > 1) {
        await updateDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredInventory = inventory.filter((item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <Container maxWidth="md" sx={{ py: 4, bgcolor: '#f0f0f0' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" color ="red" align="center">Inventory Management</Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#fff' }}>
            <Typography variant="h5">Inventory List</Typography>
            <TextField
              margin="dense"
              id="search"
              label="Search"
              type="text"
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              />
              {loading ? (
                <CircularProgress />
              ) : (
                <Grid container spacing={2}>
                  {filteredInventory.map((item) => (
                    <Grid item key={item.name} xs={12} sm={6} md={4}>
                      <Card>
                        <CardHeader
                          avatar={<Avatar>{item.name.charAt(0)}</Avatar>}
                          title={item.name}
                        />
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">
                            Quantity: {item.quantity}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button size="small" onClick={() => decrementItem(item.name)}>-</Button>
                          <Typography variant="body2" color="textSecondary">
                            {item.quantity}
                          </Typography>
                          <Button size="small" onClick={() => incrementItem(item.name)}>+</Button>
                          <Button size="small" onClick={() => removeItem(item.name)}>Remove</Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleOpen}>Add Item</Button>
          </Grid>
        </Grid>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Item</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Item Name"
              type="text"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>Add</Button>
          </DialogActions>
        </Dialog>
      </Container>
    )
  }