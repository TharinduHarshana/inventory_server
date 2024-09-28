const Sale = require('../models/saleModel');
const Customer = require('../models/customerModel');

// Create Sale
const createSale = async (req, res) => {
    try {
        const { customerId, items, totalAmount } = req.body;

        // Fetch the customer(s) based on provided ID(s)
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Store customer data in the Sale schema
        const sale = new Sale({
            customers: [
                {
                    cusID: customer.cusID,
                    cusName: customer.cusName,
                    cusEmail: customer.cusEmail,
                    cusPhone1: customer.cusPhone1,
                    cusPhone2: customer.cusPhone2,
                    cusAddress: customer.cusAddress
                }
            ],
            items: items.map(item => ({
                itemID: item.itemID,
                name: item.name,
                sellingPrice: item.sellingPrice,
                quantity: item.quantity,
                discount: item.discount,
                total: item.total
            })),
            totalAmount,
            saleStatus: 'To be Shift'
        });

        await sale.save();
        res.status(201).json({ message: 'Sale completed successfully', sale });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get All Sales
const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find();
        return res.status(200).json(sales);
    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
};

// Delete Sale
const deleteSale = async (req, res) => {
    try {
        const saleId = req.params.id; // Get sale ID from request parameters

        const sale = await Sale.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        await Sale.findByIdAndDelete(saleId); // Delete the sale
        return res.status(200).json({ message: 'Sale deleted successfully' });
    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
};


const updateSaleStatus = async (req, res) => {
    try {
        const { trackingNumber, saleStatus } = req.body;
        const saleId = req.params.id;

        const sale = await Sale.findById(saleId);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Update the tracking number and sale status
        sale.trackingNumber = trackingNumber;
        sale.saleStatus = saleStatus;

        await sale.save();
        res.status(200).json({ message: 'Sale updated successfully', sale });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



module.exports = { createSale, getAllSales, deleteSale, updateSaleStatus };