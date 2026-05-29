import asyncio
import uuid, time
from concurrent.futures import ThreadPoolExecutor

# # Simple fake conversion (takes 3 seconds)
# def fake_convert(filename):
#     print(f"Starting {filename}")
#     import time
#     time.sleep(3)  # Pretend to work
#     print(f"Finished {filename}")
#     return f"converted_{filename}"

# class SimpleManager:
#     def __init__(self):
#         self.executor = ThreadPoolExecutor(max_workers=2)
    
#     async def convert_files(self, filenames):
#         # Create a unique ID for this batch
#         batch_id = str(uuid.uuid4())[:8]  # Short ID for example
#         print(f"\n=== Batch {batch_id} started ===")
        
#         for i, filename in enumerate(filenames):
#             print(f"Starting file {i+1}/{len(filenames)}: {filename}")
            
#             # Run conversion in thread pool
#             loop = asyncio.get_event_loop()
#             result = await loop.run_in_executor(
#                 self.executor,
#                 fake_convert,
#                 filename
#             )
            
#             print(f"Completed {filename} -> {result}")
        
#         print(f"=== Batch {batch_id} complete ===\n")

# # How to use it:
# async def main():
#     manager = SimpleManager()
    
#     # Convert multiple files
#     await manager.convert_files(["cat.mp4", "dog.mp4", "bird.mp4"])

# # Run it
# asyncio.run(main())


import asyncio
import time
from concurrent.futures import ThreadPoolExecutor

# This is a BLOCKING function (like your FFmpeg)
def slow_work(seconds):
    print(f"  Started work for {seconds} seconds")
    time.sleep(seconds)  # This would normally FREEZE everything
    print(f"  Finished work after {seconds} seconds")
    return f"Result after {seconds}s"

async def main():
    
    # Create threads (workers)
    executor = ThreadPoolExecutor(max_workers=2)
    loop = asyncio.get_event_loop()
    
    # Run 2 blocking things in DIFFERENT threads (they run in parallel!)
    task1 = loop.run_in_executor(executor, slow_work, 3)  # 3 second task
    task2 = loop.run_in_executor(executor, slow_work, 2)  # 2 second task
    
    # async lets us GET the results when they're ready
    result1, result2 = await asyncio.gather(task1, task2)
    
    print(f"\nGot results: {result1}, {result2}")
    print("Both ran at the SAME time! Total time: ~3 seconds, not 5!")

asyncio.run(main())