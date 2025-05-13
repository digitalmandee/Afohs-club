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

const MembershipCancellationDialog = ({ open, onClose, onConfirm }) => {
    const [cancelReason, setCancelReason] = useState("");

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    Membership Cancellation
                </Typography>
                <IconButton size="large" sx={{ p: 0 }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Reason For Cancellation
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Enter suspension reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    variant="outlined"
                    sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 0, mt: 4, justifyContent: "flex-end" }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
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
                    sx={{
                        bgcolor: "#003153",
                        "&:hover": { bgcolor: "#00254d" },
                        textTransform: "none",
                        px: 3,
                        py: 1,
                        borderRadius: 0.5,
                    }}
                    onClick={onConfirm}
                >
                    Confirm Cancellaion
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default MembershipCancellationDialog
