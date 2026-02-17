import React from 'react';
import {
  User,
  ClipboardList,
  CheckCircle,
  Activity,
  ArrowRight,
  BarChart3,
  Search,
  Circle,
  Plus,
  Pencil,
  X,
  RefreshCw,
  FileText,
  Mail,
  Infinity,
  Menu,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const defaultSize = 24;
const defaultStroke = 2;

export const IconUser = (p) => <User size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconClipboard = (p) => <ClipboardList size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconCheck = (p) => <CheckCircle size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconActivity = (p) => <Activity size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconArrow = (p) => <ArrowRight size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconChart = (p) => <BarChart3 size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconSearch = (p) => <Search size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconCircle = (p) => <Circle size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconPlus = (p) => <Plus size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconPencil = (p) => <Pencil size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconX = (p) => <X size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconRefresh = (p) => <RefreshCw size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconFileText = (p) => <FileText size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconMail = (p) => <Mail size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconInfinity = (p) => <Infinity size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconMenu = (p) => <Menu size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconHelpCircle = (p) => <HelpCircle size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;
export const IconChevronDown = (p) => <ChevronDown size={p.size ?? defaultSize} strokeWidth={p.strokeWidth ?? defaultStroke} {...p} />;

export const ICON_MAP = {
  customers: IconUser,
  leads: IconClipboard,
  tasks: IconCheck,
  activity: IconActivity,
  pipeline: IconArrow,
  reports: IconChart,
  search: IconSearch,
  default: IconCircle,
};

export const ACTIVITY_ICON_MAP = {
  customer_created: IconPlus,
  customer_updated: IconPencil,
  customer_deleted: IconX,
  lead_created: IconPlus,
  lead_updated: IconPencil,
  lead_deleted: IconX,
  lead_status_changed: IconRefresh,
  lead_note_added: IconFileText,
  email_sent: IconMail,
  task_created: IconPlus,
  task_completed: IconCheck,
};
