"use client"

import { useState } from "react"
import SideNav from "../../Components/SideBar/SideNav"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Avatar,
  InputAdornment,
} from "@mui/material"
import { Add, Search } from "@mui/icons-material"
import { router } from "@inertiajs/react"

const drawerWidthOpen = 240
const drawerWidthClosed = 110

// Updated customer data with profile images and phone numbers
const customers = [
  {
    id: "AFOHS-12345",
    name: "Zahid Ullah",
    email: "user@gmail.com",
    phone: "0343434343",
    type: "VIP",
    address: "Lahore, Pakistan",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "AFOHS-12345",
    name: "Zahid Ullah",
    email: "user@gmail.com",
    phone: "0343434343",
    type: "Premium",
    address: "Lahore, Pakistan",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "AFOHS-12345",
    name: "Zahid Ullah",
    email: "user@gmail.com",
    phone: "0343434343",
    type: "Regular",
    address: "Lahore, Pakistan",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "AFOHS-12345",
    name: "Zahid Ullah",
    email: "user@gmail.com",
    phone: "0343434343",
    type: "Premium",
    address: "Lahore, Pakistan",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "AFOHS-12345",
    name: "Zahid Ullah",
    email: "user@gmail.com",
    phone: "0343434343",
    type: "VIP",
    address: "Lahore, Pakistan",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const CustomerTable = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SideNav open={open} setOpen={setOpen} />
      <div
        style={{
          marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
          transition: "margin-left 0.3s ease-in-out",
          padding: "7rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="medium">
            70 Customer
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              placeholder="Search name or membership type"
              size="small"
              sx={{
                width: "280px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => router.visit("/add/information")}
              sx={{
                bgcolor: "#0a3d62",
                "&:hover": { bgcolor: "#0c2461" },
                textTransform: "none",
                borderRadius: "4px",
              }}
            >
              Add Customer
            </Button>
          </Box>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: "8px", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "medium", color: "#333" }}>Membership ID</TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "#333" }}>Members</TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "#333" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "#333" }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: "medium", color: "#333" }}>Create Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer, index) => (
                  <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell sx={{ color: "#666" }}>{customer.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar src={customer.avatar} sx={{ width: 36, height: 36 }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.email}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#666" }}>{customer.type}</TableCell>
                    <TableCell sx={{ color: "#666" }}>{customer.address}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "#0a3d62",
                          "&:hover": { bgcolor: "#0c2461" },
                          textTransform: "none",
                          borderRadius: "20px",
                          px: 2,
                          py: 0.5,
                          minWidth: "80px",
                        }}
                      >
                        Order
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </>
  )
}

export default CustomerTable
