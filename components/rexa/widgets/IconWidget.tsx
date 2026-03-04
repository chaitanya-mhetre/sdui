'use client';

import { memo } from 'react';
import type { RexaLayoutNode } from '@/lib/rexa/types';
import type { LucideIcon } from 'lucide-react';
import {
  Home, Search, Settings, User, Menu, X, Plus, Pencil, Trash2,
  Heart, Star, Share2, MoreVertical, MoreHorizontal,
  Check, CheckCircle, CheckCircle2, CheckSquare, Square,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Bell, Mail, Phone, Camera, ImageIcon, Paperclip, Send,
  Info, AlertTriangle, AlertCircle, Eye, EyeOff,
  Lock, Unlock, Key, HelpCircle,
  Filter, List, LayoutGrid, LayoutDashboard,
  CreditCard, Wallet, Receipt, ShoppingCart, ShoppingBag, Tag,
  Store, Truck, Utensils, Car, Plane, Building2,
  GraduationCap, Briefcase, Calendar, Clock,
  MapPin, MapPinOff, Map, Navigation,
  MessageCircle, MessageSquare,
  Sun, Moon, Circle, Cloud, CloudUpload, CloudDownload,
  Download, Upload, RefreshCw, Power, LogOut, LogIn,
  UserPlus, Users, ThumbsUp, ThumbsDown,
  Bookmark, Flag, TrendingUp, TrendingDown,
  BarChart2, PieChart, Activity,
  Zap, Link, ExternalLink, Copy, Scissors,
  Clipboard, Minus, Star as StarFilled,
} from 'lucide-react';

// ── Material icon name → Lucide component ─────────────────────────────────
const MATERIAL_TO_LUCIDE: Record<string, LucideIcon> = {
  // Navigation & common UI
  home: Home,
  search: Search,
  settings: Settings,
  person: User,
  account_circle: User,
  menu: Menu,
  close: X,
  add: Plus,
  add_circle: Plus,
  edit: Pencil,
  create: Pencil,
  delete: Trash2,
  delete_outline: Trash2,

  // Sentiment / rating
  favorite: Heart,
  favorite_border: Heart,
  star: StarFilled,
  star_border: Star,
  star_half: Star,
  thumb_up: ThumbsUp,
  thumb_down: ThumbsDown,
  share: Share2,

  // More / overflow
  more_vert: MoreVertical,
  more_horiz: MoreHorizontal,

  // Checkmarks / status
  check: Check,
  check_circle: CheckCircle,
  check_circle_outline: CheckCircle2,
  check_box: CheckSquare,
  check_box_outline_blank: Square,
  radio_button_checked: CheckCircle2,
  radio_button_unchecked: Circle,
  done: Check,
  done_all: CheckCircle2,

  // Directional arrows
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  arrow_upward: ArrowUp,
  arrow_downward: ArrowDown,
  arrow_back_ios: ArrowLeft,
  arrow_forward_ios: ArrowRight,

  // Chevrons / keyboard
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  keyboard_arrow_up: ChevronUp,
  keyboard_arrow_down: ChevronDown,
  keyboard_arrow_right: ChevronRight,
  keyboard_arrow_left: ChevronLeft,

  // Communication
  notifications: Bell,
  notifications_none: Bell,
  notifications_active: Bell,
  notification_important: Bell,
  mail: Mail,
  email: Mail,
  mail_outline: Mail,
  phone: Phone,
  call: Phone,
  phone_in_talk: Phone,
  message: MessageSquare,
  chat: MessageCircle,
  chat_bubble: MessageCircle,
  forum: MessageSquare,
  sms: MessageSquare,
  send: Send,

  // Media / photos
  camera: Camera,
  photo_camera: Camera,
  camera_alt: Camera,
  image: ImageIcon,
  photo: ImageIcon,
  photo_library: ImageIcon,
  collections: ImageIcon,

  // Files & attachments
  attach_file: Paperclip,
  attachment: Paperclip,
  content_copy: Copy,
  copy: Copy,
  cut: Scissors,
  paste: Clipboard,
  content_paste: Clipboard,
  download: Download,
  upload: Upload,
  cloud: Cloud,
  cloud_upload: CloudUpload,
  cloud_download: CloudDownload,
  backup: CloudUpload,
  refresh: RefreshCw,
  sync: RefreshCw,
  autorenew: RefreshCw,

  // Info / alerts
  info: Info,
  info_outline: Info,
  warning: AlertTriangle,
  warning_amber: AlertTriangle,
  error: AlertCircle,
  error_outline: AlertCircle,
  help: HelpCircle,
  help_outline: HelpCircle,

  // Security
  visibility: Eye,
  visibility_off: EyeOff,
  lock: Lock,
  lock_outline: Lock,
  lock_open: Unlock,
  key: Key,

  // Filters / list / grid
  filter_list: Filter,
  filter_alt: Filter,
  tune: Filter,
  sort: ArrowUp,
  list: List,
  view_list: List,
  grid_view: LayoutGrid,
  apps: LayoutGrid,
  dashboard: LayoutDashboard,
  widgets: LayoutDashboard,

  // Commerce / finance
  payments: CreditCard,
  credit_card: CreditCard,
  account_balance_wallet: Wallet,
  receipt: Receipt,
  receipt_long: Receipt,
  shopping_cart: ShoppingCart,
  add_shopping_cart: ShoppingCart,
  shopping_bag: ShoppingBag,
  local_offer: Tag,
  sell: Tag,
  label: Tag,
  store: Store,
  storefront: Store,
  local_mall: Store,

  // Transport / delivery
  local_shipping: Truck,
  delivery_dining: Truck,
  directions_car: Car,
  commute: Car,
  flight: Plane,
  airplanemode_active: Plane,

  // Places / buildings
  restaurant: Utensils,
  hotel: Building2,
  business: Building2,
  apartment: Building2,
  local_hospital: Building2,
  school: GraduationCap,
  work: Briefcase,
  work_outline: Briefcase,

  // Time & date
  calendar_today: Calendar,
  event: Calendar,
  date_range: Calendar,
  schedule: Clock,
  access_time: Clock,
  timer: Clock,
  timelapse: Clock,
  watch_later: Clock,

  // Location
  place: MapPin,
  location_on: MapPin,
  room: MapPin,
  location_off: MapPinOff,
  my_location: MapPin,
  map: Map,
  directions: Navigation,
  navigation: Navigation,
  near_me: Navigation,
  explore: Navigation,

  // People
  person_add: UserPlus,
  group: Users,
  people: Users,
  group_add: UserPlus,

  // Bookmarks / flags
  bookmark: Bookmark,
  bookmark_border: Bookmark,
  bookmark_add: Bookmark,
  flag: Flag,
  outlined_flag: Flag,

  // Charts / analytics
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  bar_chart: BarChart2,
  pie_chart: PieChart,
  timeline: Activity,
  show_chart: Activity,
  insert_chart: BarChart2,
  analytics: Activity,

  // Misc
  bolt: Zap,
  flash_on: Zap,
  electric_bolt: Zap,
  link: Link,
  open_in_new: ExternalLink,
  launch: ExternalLink,
  power_settings_new: Power,
  logout: LogOut,
  login: LogIn,
  output: LogOut,
  input: LogIn,
  wb_sunny: Sun,
  light_mode: Sun,
  nights_stay: Moon,
  dark_mode: Moon,
  brightness_high: Sun,
  brightness_low: Moon,
  circle: Circle,
  remove: Minus,
  horizontal_rule: Minus,
};

interface IconWidgetProps {
  node: RexaLayoutNode;
}

function IconWidgetComponent({ node }: IconWidgetProps) {
  const name = ((node.name as string) ?? 'circle').toLowerCase().replace(/ /g, '_');
  const color = (node.color as string) ?? (node.style?.color as string) ?? 'currentColor';
  const size = (node.size as number) ?? (node.style?.fontSize as number) ?? 24;

  const IconComponent = MATERIAL_TO_LUCIDE[name];

  if (IconComponent) {
    return <IconComponent size={size} color={color} strokeWidth={1.8} />;
  }

  // Unmapped name: render a question-mark circle as placeholder with tooltip
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color,
      }}
      title={`icon: ${name}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
  );
}

export const IconWidget = memo(IconWidgetComponent);
