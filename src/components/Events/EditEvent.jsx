import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import { fetchEvent, updateEvent } from '../../util/http.js';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event', params.id], // unique key for editing event
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 60000, // cache for 1 minute
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = <div className='center'>
      <LoadingIndicator />
    </div>;
  }

  if (isError) {
    content = <>
      <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch event details.'} />
      <div className="form-actions">
        <Link to="../" className="button">
          OK
        </Link>
      </div>
    </>
  }
  if (data) {
    content = (
      <>
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      </>
    )
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
