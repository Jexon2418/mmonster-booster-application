-- Create a function that will be triggered when an application is submitted
CREATE OR REPLACE FUNCTION public.handle_application_submitted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'submitted'
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status <> 'submitted') THEN
    -- Make an HTTP request to the webhook URL
    PERFORM
      net.http_post(
        url := 'https://javesai.app.n8n.cloud/webhook/c576e7e7-1d8e-47ee-af17-d6a1068c8a2b',
        headers := '{"Content-Type": "application/json"}',
        body := json_build_object(
          'application_data', NEW.application_data,
          'discord_id', NEW.discord_id,
          'email', NEW.email,
          'status', NEW.status,
          'created_at', NEW.created_at,
          'updated_at', NEW.updated_at,
          'submit_count', NEW.submit_count
        )::text
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the function when a draft application is updated
DROP TRIGGER IF EXISTS on_application_submitted ON public.draft_applications;
CREATE TRIGGER on_application_submitted
  AFTER UPDATE ON public.draft_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_submitted();
