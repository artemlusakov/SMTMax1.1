import { Tooltip } from '@mui/material';
import { NavLink } from 'react-router-dom';
import './WorkingLineElement.css';

interface Props {
  id: string;
  link: string;
  size: string;
  name: string;
  title: string;
  value: number;
  titleNameElemet: string;
  idElement: string;
  linkElement: string;
  nameElement: string;
  valueElement?: number;
  selected: boolean;
  onSelect: () => void;
}

export default function WorkingLineElement(props: Props) {
  const getStatusClass = (value?: number) => {
    if (value && value > 1500) return "WorkingLine__Element_bad";
    else if (value && value > 1000) return "WorkingLine__Element_normal";
    else return "WorkingLine__Element_good";
  };

  return (
    <Tooltip title={`${props.title} id: ${props.id}`}>
      <NavLink 
        to={`${props.link}/${props.id}`}
        className={`WorkingLine__Element ${props.size} ${getStatusClass(props.value)} ${
          props.selected ? 'selected' : ''
        }`}
        onClick={(e) => {
          e.preventDefault();
          props.onSelect();
        }}
      >
        <div>{props.name}</div>
        {props.selected && <div className="selection-marker">✓</div>}
      </NavLink>
    </Tooltip>
  );
}