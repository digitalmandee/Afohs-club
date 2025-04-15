"use client"

import { useState } from "react"
import { Box, Typography, Button, Paper, Radio, RadioGroup, Container } from "@mui/material"
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  ArrowForward as ArrowForwardIcon,
  AccountBalanceWallet as WalletIcon,
  AccountBalance as BankIcon,
} from "@mui/icons-material"
import "bootstrap/dist/css/bootstrap.min.css"

const QRScreen = () => {
  const [activeTab, setActiveTab] = useState("split")
  const [customer1Expanded, setCustomer1Expanded] = useState(true)
  const [customer2Expanded, setCustomer2Expanded] = useState(false)
  const [paymentMethod1, setPaymentMethod1] = useState("e-wallet")
  const [paymentMethod2, setPaymentMethod2] = useState("")

  return (
    <Container maxWidth="md" sx={{
        bgcolor:'transparent'
    }}>
      <Paper sx={{ p: 3, borderRadius: 1, maxWidth: "650px", mx: "auto", bgcolor:'transparent' }}>

        {/* Customer 1 */}
        <Paper
          elevation={0}
          sx={{
            // border: "1px solid #dee2e6",
            borderRadius: 1,
            // mb: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            //   p: 1,
              cursor: "pointer",
              borderBottom: customer1Expanded ? "1px solid #dee2e6" : "none",
            }}
            onClick={() => setCustomer1Expanded(!customer1Expanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {customer1Expanded ? <KeyboardArrowUpIcon color="action" /> : <KeyboardArrowDownIcon color="action" />}
              <Typography variant="subtitle1" sx={{ fontWeight: "medium", ml: 1 }}>
                Customer #1
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Customer Name : Andy Rs 26.32
            </Typography>
          </Box>

          {customer1Expanded && (
            <Box sx={{ p: 3 }}>
              <RadioGroup
                row
                value={paymentMethod1}
                onChange={(e) => setPaymentMethod1(e.target.value)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #dee2e6",
                    borderRadius: 1,
                    p: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box component="span" sx={{ mr: 1, display: "flex" }}>
                      💵
                    </Box>
                    <Typography variant="body2">Cash</Typography>
                  </Box>
                  <Radio
                    value="cash"
                    size="small"
                    sx={{
                      p: 0,
                      color: "#dee2e6",
                      "&.Mui-checked": {
                        color: "#0f3460",
                      },
                    }}
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #dee2e6",
                    borderRadius: 1,
                    p: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <BankIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">Bank Transfer</Typography>
                  </Box>
                  <Radio
                    value="bank"
                    size="small"
                    sx={{
                      p: 0,
                      color: "#dee2e6",
                      "&.Mui-checked": {
                        color: "#0f3460",
                      },
                    }}
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    border: paymentMethod1 === "e-wallet" ? "1px solid #0f3460" : "1px solid #dee2e6",
                    borderRadius: 1,
                    p: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <WalletIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">E-Wallet</Typography>
                  </Box>
                  <Radio
                    value="e-wallet"
                    size="small"
                    sx={{
                      p: 0,
                      color: "#dee2e6",
                      "&.Mui-checked": {
                        color: "#0f3460",
                      },
                    }}
                  />
                </Paper>
              </RadioGroup>

              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "medium", mb: 1 }}>
                  QR Code Payment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Wait for the customer scan the QR code to make payment
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: "250px",
                      height: "250px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/qr-code%201-n0I8yy2ejBSr74XdPQZ096iydJiDLx.png"
                      alt="QR Code Payment"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "inline-block",
                    backgroundColor: "#f8f9fa",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">Code: imajicoffee321</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Customer 2 */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #dee2e6",
            borderRadius: 1,
            mb: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              cursor: "pointer",
              borderBottom: customer2Expanded ? "1px solid #dee2e6" : "none",
            }}
            onClick={() => setCustomer2Expanded(!customer2Expanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {customer2Expanded ? <KeyboardArrowUpIcon color="action" /> : <KeyboardArrowDownIcon color="action" />}
              <Typography variant="subtitle1" sx={{ fontWeight: "medium", ml: 1 }}>
                Customer #2
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Customer Name : James Rs 26.32
            </Typography>
          </Box>

          {customer2Expanded && (
            <Box sx={{ p: 3 }}>
              <RadioGroup
                row
                value={paymentMethod2}
                onChange={(e) => setPaymentMethod2(e.target.value)}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #dee2e6",
                    borderRadius: 1,
                    p: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box component="span" sx={{ mr: 1, display: "flex" }}>
                      💵
                    </Box>
                    <Typography variant="body2">Cash</Typography>
                  </Box>
                  <Radio
                    value="cash"
                    size="small"
                    sx={{
                      p: 0,
                      color: "#dee2e6",
                      "&.Mui-checked": {
                        color: "#0f3460",
                      },
                    }}
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid #dee2e6",
                    borderRadius: 1,
                    p: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <BankIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">Bank Transfer</Typography>
                  </Box>
                  <Radio
                    value="bank"
                    size="small"
                    sx={{
                      p: 0,
                      color: "#dee2e6",
                      "&.Mui-checked": {
                        color: "#0f3460",
                      },
                    }}
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    border: paymentMethod2 === "e-wallet" ? "1px solid #0f3460" : "1px solid #dee2e6",
                    borderRadius: 1,
                    p: 1,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <WalletIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">E-Wallet</Typography>
                  </Box>
                  <Radio
                    value="e-wallet"
                    size="small"
                    sx={{
                      p: 0,
                      color: "#dee2e6",
                      "&.Mui-checked": {
                        color: "#0f3460",
                      },
                    }}
                  />
                </Paper>
              </RadioGroup>
            </Box>
          )}
        </Paper>

        {/* Footer */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          <Button
            variant="text"
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: "normal",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: "#0f3460",
              "&:hover": {
                backgroundColor: "#0a2748",
              },
              textTransform: "none",
              px: 3,
            }}
          >
            Pay Now
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default QRScreen

