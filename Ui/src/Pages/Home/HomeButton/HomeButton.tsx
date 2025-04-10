import React from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';

interface HomeButtonsProps {
  selectedCount: number;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  hasSingleSelection: boolean;
  editMode: boolean;
}

const HomeButtons: React.FC<HomeButtonsProps> = ({
  selectedCount,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  hasSingleSelection,
  editMode
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />}
        color="success"
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 3
        }}
        onClick={onAdd}
        disabled={!editMode} // Блокируем в обычном режиме
      >
        Добавить
      </Button>

      <Button 
        variant="outlined" 
        startIcon={<EditIcon />}
        color="info"
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 3
        }}
        disabled={!hasSingleSelection || !editMode} // Блокируем в обычном режиме
        onClick={onEdit}
      >
        Редактировать
      </Button>

      <Button 
        variant="outlined" 
        startIcon={<DeleteIcon />}
        color="error"
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          px: 3
        }}
        disabled={selectedCount === 0 || !editMode} // Блокируем в обычном режиме
        onClick={onDelete}
      >
        Удалить ({selectedCount})
      </Button>
    </Box>
  );
};

export default HomeButtons;