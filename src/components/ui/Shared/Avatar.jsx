// src/components/Shared/Avatar.jsx
const COLORS = ['blue', 'teal', 'coral', 'purple', 'amber', 'pink'];

const getColor = (name = '') => {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
};

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Avatar = ({ name = '', size = 'md', src = null, online = false, group = false }) => {
  const color = getColor(name);
  const sizeClass = size === 'sm' ? 'sky-avatar-sm' : size === 'lg' ? 'sky-avatar-lg' : '';
  const groupClass = group ? 'sky-avatar-group' : '';

  return (
    <div
      className={`sky-avatar sky-avatar-${color} ${sizeClass} ${groupClass}`}
      style={{ flexShrink: 0 }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
        />
      ) : (
        getInitials(name)
      )}
      {online && <span className="online-indicator" />}
    </div>
  );
};

export default Avatar;