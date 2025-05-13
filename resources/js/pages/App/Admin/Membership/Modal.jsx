import { useState } from "react"
import {
    Box,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

const MembershipSuspensionDialog = () => {
    const [open, setOpen] = useState(true)
    const [suspensionReason, setSuspensionReason] = useState("")
    const [suspensionDuration, setSuspensionDuration] = useState("1Day")

    const handleClose = () => {
        setOpen(false)
    }

    const handleConfirm = () => {
        console.log("Suspension confirmed with reason:", suspensionReason, "and duration:", suspensionDuration)
        handleClose()
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    m: 0,
                    width: '600px',
                    borderRadius: 2,
                    p:2
                },
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 500, fontSize: 28 }}>
                    Membership suspended
                </Typography>
                <IconButton onClick={handleClose} size="large" sx={{ p: 0 }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Reason For Suspension
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Enter suspension reason"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    variant="outlined"
                    sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                        },
                    }}
                />

                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Suspension Duration
                </Typography>
                <FormControl component="fieldset">
                    <RadioGroup
                        row
                        value={suspensionDuration}
                        onChange={(e) => setSuspensionDuration(e.target.value)}
                        sx={{ gap: 1 }}
                    >
                        <FormControlLabel
                            value="1Day"
                            control={
                                <Radio
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#003153",
                                        },
                                    }}
                                />
                            }
                            label="1 Day"
                            sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                m: 0,
                                px: 1,
                                "&:has(.Mui-checked)": {
                                    borderColor: "#003153",
                                },
                            }}
                        />
                        <FormControlLabel
                            value="1Monthly"
                            control={
                                <Radio
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#003153",
                                        },
                                    }}
                                />
                            }
                            label="1 Monthly"
                            sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                m: 0,
                                px: 1,
                                "&:has(.Mui-checked)": {
                                    borderColor: "#003153",
                                },
                            }}
                        />
                        <FormControlLabel
                            value="1Year"
                            control={
                                <Radio
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#003153",
                                        },
                                    }}
                                />
                            }
                            label="1 Year"
                            sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                m: 0,
                                px: 1,
                                "&:has(.Mui-checked)": {
                                    borderColor: "#003153",
                                },
                            }}
                        />
                        <FormControlLabel
                            value="CustomDate"
                            control={
                                <Radio
                                    sx={{
                                        "&.Mui-checked": {
                                            color: "#003153",
                                        },
                                    }}
                                />
                            }
                            label="Custom Date"
                            sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                                m: 0,
                                px: 1,
                                "&:has(.Mui-checked)": {
                                    borderColor: "#003153",
                                },
                            }}
                        />
                    </RadioGroup>
                </FormControl>
            </DialogContent>

            <DialogActions sx={{ p: 0, mt: 4, justifyContent: "flex-end" }}>
                <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{
                        borderColor: "#003153",
                        color: "#003153",
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        mr: 1,
                        borderRadius: 0.5,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    sx={{
                        bgcolor: "#003153",
                        "&:hover": { bgcolor: "#00254d" },
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        borderRadius: 0.5,
                    }}
                >
                    Confirm Suspend
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default MembershipSuspensionDialog
