const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Returns the full URL for an uploaded file.
 * Falls back to the original src (for static assets) if it doesn't look like a UUID filename.
 */
export function imageUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('/')) return filename;
  const uuidPattern = /^[0-9a-f-]{36}\./i;
  if (uuidPattern.test(filename)) {
    // Use the Vite proxy path so it works in dev and prod
    return `/uploads/${filename}`;
  }
  return `/src/assets/${filename}`;
}

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Social Links
  getSocialLinks: () => request('/social-links'),
  createSocialLink: (data) => request('/social-links', { method: 'POST', body: JSON.stringify(data) }),
  updateSocialLink: (id, data) => request(`/social-links/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSocialLink: (id) => request(`/social-links/${id}`, { method: 'DELETE' }),

  // Skills
  getSkills: () => request('/skills'),
  createSkillGroup: (data) => request('/skills/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateSkillGroup: (id, data) => request(`/skills/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSkillGroup: (id) => request(`/skills/groups/${id}`, { method: 'DELETE' }),
  createSkill: (formData) => request('/skills', { method: 'POST', body: formData }),
  updateSkill: (id, formData) => request(`/skills/${id}`, { method: 'PUT', body: formData }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  // Experiences
  getExperiences: () => request('/experiences'),
  createExperience: (formData) =>
    request('/experiences', { method: 'POST', body: formData }),
  updateExperience: (id, formData) =>
    request(`/experiences/${id}`, { method: 'PUT', body: formData }),
  deleteExperience: (id) => request(`/experiences/${id}`, { method: 'DELETE' }),

  // Education
  getEducation: () => request('/education'),
  createEducation: (formData) =>
    request('/education', { method: 'POST', body: formData }),
  updateEducation: (id, formData) =>
    request(`/education/${id}`, { method: 'PUT', body: formData }),
  deleteEducation: (id) => request(`/education/${id}`, { method: 'DELETE' }),

  // Certificates
  getCertificates: () => request('/certificates'),
  createCertificate: (formData) =>
    request('/certificates', { method: 'POST', body: formData }),
  updateCertificate: (id, formData) =>
    request(`/certificates/${id}`, { method: 'PUT', body: formData }),
  deleteCertificate: (id) => request(`/certificates/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: () => request('/activities'),
  createActivity: (formData) =>
    request('/activities', { method: 'POST', body: formData }),
  updateActivity: (id, formData) =>
    request(`/activities/${id}`, { method: 'PUT', body: formData }),
  deleteActivity: (id) => request(`/activities/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (featured) =>
    request(`/projects${featured ? '?featured=true' : ''}`),
  createProject: (formData) =>
    request('/projects', { method: 'POST', body: formData }),
  updateProject: (id, formData) =>
    request(`/projects/${id}`, { method: 'PUT', body: formData }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  // Messages
  sendMessage: (data) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: () => request('/messages'),
  markMessageRead: (id) => request(`/messages/${id}/read`, { method: 'PUT' }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),
};
