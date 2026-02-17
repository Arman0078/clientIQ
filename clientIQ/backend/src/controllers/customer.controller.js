import Customer from '../models/Customer.js';
import { logActivity } from '../utils/logActivity.js';

export const getCustomers = async (req, res) => {
  try {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const search = String(req.query.search || '').trim();
    const skip = (pageNum - 1) * limitNum;

    const filter = { createdBy: req.user._id };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { company: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({
      customers,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate('createdBy', 'name email');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, notes, image } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const customer = await Customer.create({
      name,
      email,
      phone: phone || '',
      company: company || '',
      notes: notes || '',
      image: image || '',
      createdBy: req.user._id,
    });
    await logActivity('customer_created', 'Customer', customer._id, `Created customer "${name}"`, req.user._id, { name, email });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const { name, email, phone, company, notes, image } = req.body;
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (company !== undefined) customer.company = company;
    if (notes !== undefined) customer.notes = notes;
    if (image !== undefined) customer.image = image;
    await customer.save();
    await logActivity('customer_updated', 'Customer', customer._id, `Updated customer "${customer.name}"`, req.user._id);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const name = customer.name;
    await customer.deleteOne();
    await logActivity('customer_deleted', 'Customer', req.params.id, `Deleted customer "${name}"`, req.user._id);
    res.json({ message: 'Customer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
