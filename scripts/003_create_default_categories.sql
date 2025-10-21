-- Create function to add default categories for new users
create or replace function public.create_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert default categories
  insert into public.categories (user_id, name, color, icon)
  values
    (new.id, 'Home', '#3b82f6', 'Home'),
    (new.id, 'Work', '#8b5cf6', 'Briefcase'),
    (new.id, 'Personal', '#10b981', 'User');

  return new;
end;
$$;

-- Create trigger to add default categories when profile is created
drop trigger if exists on_profile_created on public.profiles;

create trigger on_profile_created
  after insert on public.profiles
  for each row
  execute function public.create_default_categories();
