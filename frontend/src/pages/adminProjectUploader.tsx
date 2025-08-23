import { useState, type FormEvent } from 'react';
import './adminKnowledgeUploader.css';

const AdminProjectUploader = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [donationInfo, setDonationInfo] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [status, setStatus] = useState('Ready');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('Loading');
    try {
      const { error } = await supabase.from('projects').insert({
        name,
        description,
        donation_info: donationInfo,
        contact_info: contactInfo,
      });

      if (error) throw error;
      
      setStatus('Success! Project added.');
      setName('');
      setDescription('');
      setDonationInfo('');
      setContactInfo('');
      setTimeout(() => setStatus('Ready'), 3000);

    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };
  
  const getStatusClass = () => {
      if (status === 'Loading') return 'status-loading';
      if (status === 'Success') return 'status-success';
      if (status === 'Error') return 'status-error';
      return 'status-ready';
    };

  return (
    <div className="admin-uploader-container">
      <h2>Add New Project or Event</h2>
      <form onSubmit={handleSubmit} className="admin-uploader-form">
        <label>Project Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        
        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required />

        <label>Donation Information</label>
        <input type="text" value={donationInfo} onChange={e => setDonationInfo(e.target.value)} placeholder="e.g., Donate via our website..." />
        
        <label>Contact Information</label>
        <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="e.g., For questions, email..." />

        <button type="submit" disabled={status === 'Loading'}>Add Project</button>
      </form>
      <p className={`admin-uploader-status ${getStatusClass()}`}><strong>Status:</strong> {status}</p>
    </div>
  );
};

export default AdminProjectUploader;