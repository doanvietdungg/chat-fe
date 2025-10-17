import { 
  Layout, 
  Input, 
  Button, 
  List, 
  Avatar, 
  Badge, 
  Card, 
  Space, 
  Typography, 
  PageHeader, 
  Modal, 
  Radio, 
  Switch, 
  Tag, 
  Alert,
  Skeleton,
  Spin,
  Textarea
} from 'ant-design-vue'

// Import Ant Design styles
import 'ant-design-vue/dist/reset.css'

export default function setupAntDesign(app) {
  // Register components globally
  app.use(Layout)
  app.use(Input)
  app.use(Button)
  app.use(List)
  app.use(Avatar)
  app.use(Badge)
  app.use(Card)
  app.use(Space)
  app.use(Typography)
  app.use(PageHeader)
  app.use(Modal)
  app.use(Radio)
  app.use(Switch)
  app.use(Tag)
  app.use(Alert)
  app.use(Skeleton)
  app.use(Spin)
  app.use(Textarea)
}