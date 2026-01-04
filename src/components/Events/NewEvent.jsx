import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { createNewEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();
  
  // mutation will not be executed until we call mutate
  const { mutate, isPending, isError, error } = useMutation({
    // mutationKey not needed here as we are not using it to identify/cache the mutation
    mutationFn: createNewEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['events'] // can use exact: true if needed to only refetch this specific query
      }); // causes refetch of all queries to ensure fresh data
      navigate('/events');
    }
  });


  function handleSubmit(formData) {
    mutate({
      event: formData
    })
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && <ErrorBlock title="Failed to create event" message={error.info?.message || 'Failed to create event, please check and try again.'} />}
    </Modal>
  );
}
